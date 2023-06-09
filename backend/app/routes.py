import os
import json
import csv
from uuid import uuid4 as uuid
from flask import abort, jsonify, request, send_file
from psycopg2 import connect, sql
from psycopg2.extras import execute_values
from app import app

def getConnection():
    return connect(
        host = os.environ['DB_HOST'],
        dbname = os.environ['DB_NAME'],
        user = os.environ['DB_USER'],
        password = os.environ['DB_USER_PASSWORD'],
    )

def _need_keep_temp_file():
    """Check environ whether or not to keep the temporary files created."""
    if 'KEEP_TEMP_FILE' not in os.environ:
        return False
    return os.environ['KEEP_TEMP_FILE'] == 'true'


@app.errorhandler(400)
def request_error(e):
    """parse flask's default abort HTML into a JSON object containing the error message"""
    return jsonify(error=e.description), 400


@app.errorhandler(501)
def not_implemented_error(e):
    """parse flask's default abort HTML into a JSON object containing the error message"""
    return jsonify(error=e.description), 501


@app.route('/')
def index():
    return "Travel Time webapp backend"


@app.route('/closest-node/<longitude>/<latitude>', methods=['GET'])
def get_closest_node(longitude, latitude):
    """
    This function fetches a set of closest nodes to the given
    point, sorted by ascending distance order.

    :param longitude: the longitude of the origin point
    :param latitude: the latitude of the origin point
    :return: JSON of an array containing the closest nodes.
            The array is sorted in ascending distance order. node object keys: node_id(int),
            geometry(geom{type(str), coordinates(list[int])}), name(str)
    """

    try:
        longitude = float(longitude)
        latitude = float(latitude)
    except ValueError or ArithmeticError:
        abort(400, description="Longitude and latitude must be decimal numbers!")
        return


    with getConnection() as connection:
        with connection.cursor() as cursor:
            select_sql = '''
                WITH distances AS (	
                    SELECT 
                        congestion.network_nodes.node_id,
                        here.routing_nodes_intersec_name.intersec_name AS stname,
                        congestion.network_nodes.geom::geography <-> st_makepoint(%(longitude)s, %(latitude)s)::geography AS distance
                    FROM congestion.network_nodes
                    JOIN here.routing_nodes_intersec_name USING (node_id)
                    WHERE congestion.network_nodes.geom::geography <-> st_makepoint(%(longitude)s, %(latitude)s)::geography < 1000
                    ORDER BY distance
                    LIMIT 10
                )
                SELECT 
                    congestion_nodes.node_id::int,
                    stname,
                    st_asgeojson(geom),
                    distance
                FROM congestion.network_nodes AS congestion_nodes
                JOIN distances ON congestion_nodes.node_id = distances.node_id
                ORDER BY distance
                '''
            cursor.execute(select_sql, {"latitude": latitude, "longitude": longitude})

            candidate_nodes = []
            node_count = 0
            for node_id, stname, coord_dict, distance in cursor.fetchall():
                if node_count == 0 or distance < 10:
                    candidate_nodes.append( {
                        'node_id': node_id,
                        'name': stname,
                        'geometry': json.loads(coord_dict)
                    } )
                else:
                    break
                node_count += 1
    connection.close()
    return jsonify(candidate_nodes)


@app.route('/link-nodes/<from_node_id>/<to_node_id>', methods=['GET'])
def get_links_between_two_nodes(from_node_id, to_node_id):
    """Returns links of the shortest path between two nodes on the HERE network"""
    try:
        from_node_id = int(from_node_id)
        to_node_id = int(to_node_id)
    except ValueError or ArithmeticError:
        abort(400, description="The node_ids should be integers")
        return

    if from_node_id == to_node_id:
        abort(400, description="Source node can not be the same as target node.")
        return

    connection = getConnection()

    with connection:
        with connection.cursor() as cursor:
            cursor.execute('''
                WITH results as (
                    SELECT *
                    FROM here_gis.get_links_btwn_nodes_22_2(
                        '%(node_start)s',
                        '%(node_end)s'
                    ),
                    UNNEST (links) WITH ORDINALITY AS unnested (link_dir, seq)
                )

                SELECT 
                    results.link_dir,
                    attr.st_name,
                    results.seq,
                    seg_lookup.segment_id,
                    ST_AsGeoJSON(streets.geom) AS geom,
                    ST_Length( ST_Transform(streets.geom,2952) ) / 1000 AS length_km
                FROM results
                JOIN here.routing_streets_22_2 AS streets USING ( link_dir )
                JOIN here_gis.streets_att_22_2 AS attr 
                    ON attr.link_id::int = substring(link_dir,'\d+')::int
                JOIN congestion.network_links_22_2 AS seg_lookup USING ( link_dir )
                ORDER BY seq;
                ''',
                {"node_start": from_node_id, "node_end": to_node_id}
            )

            links = []
            for link_dir, st_name, seq, segment_id, geom, length_km in cursor.fetchall(): 
                links.append({
                    'link_dir': link_dir,
                    'name': st_name,
                    'sequence': seq,
                    'segment_id': segment_id,
                    'geometry': json.loads(geom),
                    'length_km': length_km
                })

    shortest_link_data = {
        "source": from_node_id, 
        "target": to_node_id,
        "links": links,
        # the following three fields are for compatibility and should eventually be removed
        "path_name": "",
        "link_dirs": [ link['link_dir'] for link in links ],
        "geometry": {
            "type": "MultiLineString",
            "coordinates": [ link['geometry']['coordinates'] for link in links ]
        }
    }
    connection.close()
    return jsonify(shortest_link_data)


@app.route(
    '/aggregate-travel-times/<start_node>/<end_node>/<start_time>/<end_time>/<start_date>/<end_date>/<incl_holiday>/<dow_list>',
    methods=['GET']
)
# aggregate_travel_times()
#
# Params:
# - start_node(int): the node_id of the starting node
# - end_node(int): the node_id of the end node
# - start_time(int): starting hour of aggregation
# - end_time(int): end hour of aggregation
# - start_date(datetime): start date of aggregation
# - end_date(datetime): end date of aggregation
# - incl_holiday(bool): inputs [0(false),1(true)], whether to include days marked as holidays in aggregation (schema ref.holidays)
# - dow_list(str): flattened list of integers, i.e. [1,2,3,4] -> '1234', representing days of week to be included
#
def aggregate_travel_times(start_node, end_node, start_time, end_time, start_date, end_date, incl_holiday: bool, dow_list):
    agg_tt_query = agg_tt = ''' 
        WITH routing AS (
            SELECT * FROM congestion.get_segments_btwn_nodes(%(node_start)s,%(node_end)s)
        ),
        
        unnest_cte AS (
            SELECT
                rgs.length AS corridor_length,
                unnest(rgs.segment_list) AS segment_id
            FROM routing AS rgs
        ),

        routed AS (
            SELECT
                uc.segment_id,
                uc.corridor_length
            FROM unnest_cte AS uc
            INNER JOIN congestion.network_segments AS cns
                ON cns.segment_id = uc.segment_id
        ),

        -- Aggregate segments to corridor on a daily, hourly basis
        corridor_hourly_daily_agg AS (
            SELECT
                cn.dt,
                cn.hr,
                routed.corridor_length,
                SUM(cn.unadjusted_tt) AS corr_hourly_daily_tt
            FROM routed 
            JOIN congestion.network_segments_daily AS cn USING (segment_id)
            WHERE   
                cn.hr <@ %(time_range)s::numrange
                AND date_part('isodow', cn.dt)::integer IN %(dow_list)s
                AND cn.dt <@ %(date_range)s::daterange
                AND NOT EXISTS (
                    SELECT %(incl_holiday)s FROM ref.holiday WHERE cn.dt = holiday.dt -- excluding holidays
                )
            GROUP BY
                cn.dt,
                cn.hr,
                routed.corridor_length
            -- where corridor has at least 80pct of links with data
            HAVING SUM(cn.length_w_data) >= routed.corridor_length * 0.8 
        ), 

        -- Average the hours selected into daily period level data
        corridor_period_daily_avg_tt AS ( 
            SELECT
                dt,
                AVG(corr_hourly_daily_tt) AS avg_corr_period_daily_tt
            FROM corridor_hourly_daily_agg 
            GROUP BY 
                dt
        )

        -- Average all the days with data to get period level data for each date range
        SELECT 
            ROUND(AVG(avg_corr_period_daily_tt) / 60, 2) AS average_tt_min
        FROM corridor_period_daily_avg_tt 
    '''

    if incl_holiday:
        holiday = '0,1'
    else: 
        holiday = '1'

    print(tuple(dow_list))

    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(
                agg_tt_query, 
                {
                    "node_start": start_node,
                    "node_end": end_node,
                    "time_range": f"[{start_time},{end_time})", # ints
                    "date_range": f"[{start_date},{end_date})", # 'YYYY-MM-DD'
                    "incl_holiday": holiday,
                    "dow_list": tuple(dow_list)
                }
            )
            travel_time, = cursor.fetchone()
    return jsonify({'travel_time': float(travel_time)})



@app.route('/date-bounds', methods=['GET'])
def get_date_bounds():
    """
    Get the earliest timestamp and latest timestamp in the travel database.
    The timestamps are formatted by DATE_TIME_FORMAT ("%Y-%m-%d).

    :return: JSON containing two fields: start_time and end_time
    """
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT MIN(dt), MAX(dt) FROM here.ta;')
            ( min_date, max_date ) = cursor.fetchone()
    connection.close()
    return {
        "start_time": min_date.strftime('%Y-%m-%d'),
        "end_time": max_date.strftime('%Y-%m-%d')
    }
