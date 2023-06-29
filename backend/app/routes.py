import os
import json
import re
from datetime import datetime
from flask import abort, jsonify
from psycopg2 import connect
from app import app

def getConnection():
    return connect(
        host = os.environ['DB_HOST'],
        dbname = os.environ['DB_NAME'],
        user = os.environ['DB_USER'],
        password = os.environ['DB_USER_PASSWORD'],
    )

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

# test URL /closest-node/-79.3400/43.6610
@app.route('/closest-node/<longitude>/<latitude>', methods=['GET'])
def get_closest_node(longitude, latitude):
    """
    This function fetches a set of closest nodes to the given
    point, sorted by ascending order of distance.
    returns a GeoJSON feature for each node
    """

    try:
        longitude = float(longitude)
        latitude = float(latitude)
    except:
        return jsonify({'error': "Longitude and latitude must be decimal numbers!"})


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

# test URL /link-nodes/30421154/30421153
@app.route('/link-nodes/<from_node_id>/<to_node_id>', methods=['GET'])
def get_links_between_two_nodes(from_node_id, to_node_id):
    """Returns links of the shortest path between two nodes on the HERE network"""
    try:
        from_node_id = int(from_node_id)
        to_node_id = int(to_node_id)
    except:
        return jsonify({'error': "The node_ids should be integers"}), 400

    if from_node_id == to_node_id:
        return jsonify({'error': "Source node can not be the same as target node."}), 400

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

# test URL /aggregate-travel-times/30310940/30310942/9/12/2020-05-01/2020-06-01/true/2
@app.route(
    '/aggregate-travel-times/<start_node>/<end_node>/<start_time>/<end_time>/<start_date>/<end_date>/<include_holidays>/<dow_str>',
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
# - include_holidays(bool): Set to 'true' to include holidays in aggregation, otherwise 'false' to exclude holidays.
# - dow_list(str): flattened list of integers, i.e. [1,2,3,4] -> '1234', representing days of week to be included
#
def aggregate_travel_times(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_str):
    print(include_holidays)
    #node_id checker
    try:
        start_node = int(start_node)
        end_node = int(end_node)
    except ValueError or ArithmeticError:
        return jsonify({'error': "The node_ids should be integers"}), 400

    #time checker
    try:
        start_time = int(start_time)
        end_time = int(end_time)
    except:
        return jsonify({'error': "time is not in a valid format, i.e.(H or HH)"}), 400

    #date checker
    try:
        datetime.strptime(start_date,"%Y-%m-%d")
        datetime.strptime(end_date,"%Y-%m-%d")
    except:
        return jsonify({'error': "dates are not in a valid format, i.e.(YYYY-MM-DD)"}), 400

    #include_holidays checker
    if include_holidays != 'true' and include_holidays != 'false':
        return jsonify({'error': "include_holidays not in valid format, i.e. ('true', 'false')"}), 400

    #dow_list checker
    dow_list = re.findall(r"[1-7]", dow_str)
    if len(dow_list) == 0:
        #Raise error and return without executing query: dow list does not contain valid characters
        return jsonify({'error': "dow list does not contain valid characters, i.e. [1-7]"})

    holiday_query = ''
    if include_holidays == 'false':
        holiday_query = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE cn.dt = holiday.dt -- excluding holidays
        ) '''
    
    agg_tt_query = f''' 
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
            {holiday_query}
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
                    "dow_list": tuple(dow_list)
                }
            )
            travel_time, = cursor.fetchone()
    return jsonify({'travel_time': float(travel_time)})


# test URL /date-bounds
@app.route('/date-bounds', methods=['GET'])
def get_date_bounds():
    """
    Get the earliest date and latest data in the travel database.
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
