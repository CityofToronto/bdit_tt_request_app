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
    """Returns the shortest path between two nodes."""
    try:
        from_node_id = int(from_node_id)
        to_node_id = int(to_node_id)
    except ValueError or ArithmeticError:
        abort(400, description="The node_ids should be integers!")
        return

    if from_node_id == to_node_id:
        abort(400, description="Source node can not be the same as target node.")
        return

    connection = getConnection()

    with connection:
        with connection.cursor() as cursor:
            #Uses pg_routing to route between the start node and end node on the HERE
            #links network. Returns inputs and an array of link_dirs and a unioned line
            #TODO: convert to here_gis.get_links_between_nodes
            select_sql = '''
                WITH results as (
                    SELECT *
                    FROM pgr_dijkstra(
                        'SELECT id, source::int, target::int, length::int AS cost FROM here.routing_streets_name',
                        %(node_start)s,
                        %(node_end)s
                    )
                )

                SELECT 
                    %(node_start)s,
                    %(node_end)s,
                    array_agg(st_name),
                    array_agg(link_dir),
                    ST_AsGeoJSON(ST_union(ST_linemerge(geom))) AS geometry
                FROM results
                INNER JOIN here.routing_streets_name on edge = id'''
            cursor.execute(select_sql, {"node_start": from_node_id, "node_end": to_node_id})
            source, target, path, link_dirs, geometry = cursor.fetchone()

    # Set of street names used in path
    uniqueNames = []
    for stname in path:
        if stname not in uniqueNames:
            uniqueNames.append(stname)

    shortest_link_data = {
        "source": source, 
        "target": target,
        "path_name": ', '.join(uniqueNames), 
        "link_dirs": link_dirs, 
        "geometry": json.loads(geometry) # parse json to object here; it will be dumped back to text in a second
    }
    connection.close()
    return jsonify(shortest_link_data)


#@app.route('/aggregate-travel-times', methods=['POST'])
#def aggregate_travel_times():
@app.route('/aggregate-travel-times/<from_node_id>/<to_node_id>', methods=['GET'])
def aggregate_travel_times(from_node_id, to_node_id):
    # results will be written to file here (random, non-conflicting filenames)
    # here_22_2 -> linkdir -> segment_links -> network_segments
    filePath = f"{os.getcwd()}/tmp/{uuid()}.csv"
    print(request.json)

    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            segments = ''' WITH node_lookup(uid, corridor, from_street, to_street, direction, %(node_start)s, %(node_end)s) AS (
                            VALUES
                            -- Danforth from Broadview Ave to Coxwell Ave 30420787
                            (1, 'Danforth Ave', 'Broadview Ave', 'Coxwell Ave', 'EB', %(node_start)s, 30423234),
                            (2, 'Danforth Ave', 'Coxwell Ave', 'Broadview Ave', 'WB', 30423234, %(node_start)s),
                            -- Danforth from Coxwell Ave to Victoria Park Ave
                            (3, 'Danforth Ave', 'Coxwell Ave', 'Victoria Park Ave', 'EB', 30423234, 30440490),
                            (4, 'Danforth Ave', 'Victoria Park Ave', 'Coxwell Ave', 'WB', 30440490, 30423234),
                            -- Gerrard from Broadview Ave to Coxwell Ave
                            (5, 'Gerrard St E', 'Broadview Ave', 'Coxwell Ave', 'EB', 30420729, 30438577),
                            (6, 'Gerrard St E', 'Coxwell Ave', 'Broadview Ave', 'WB', 30438577, 30420729),
                            -- Gerrard from Coxwell Ave to Victoria Park Ave
                            (7, 'Gerrard St E', 'Coxwell Ave', 'Victoria Park Ave', 'EB', 30421768, 30440480),
                            (8, 'Gerrard St E', 'Victoria Park Ave', 'Coxwell Ave', 'WB', 30440480, 30421768),
                            -- Mortimer from Broadview Ave to Coxwell Ave
                            (9, 'Mortimer Ave', 'Broadview Ave', 'Coxwell Ave', 'EB', 30421832, 30423224),
                            (10, 'Mortimer Ave', 'Coxwell Ave', 'Broadview Ave', 'WB', 30423224, 30421832),
                            -- Mortimer from Coxwell Ave to Main St 30439771
                            (11, 'Mortimer Ave', 'Coxwell Ave', 'Main St', 'EB', 30423224, %(node_end)s),
                            (12, 'Mortimer Ave', 'Main St', 'Coxwell Ave', 'WB', %(node_end)s, 30423224)
                        ),

                        routing AS (
                            SELECT
                                nl.uid,
                                nl.corridor,
                                nl.from_street,
                                nl.to_street,
                                nl.direction,
                                nl.start_node,
                                nl.end_node,
                                segs.segment_list,
                                segs.length AS corridor_length,
                                array_length(segs.segment_list, 1) AS num_seg
                            FROM node_lookup AS nl,
                                LATERAL(SELECT * FROM congestion.get_segments_btwn_nodes(nl.start_node::int, nl.end_node::int)) AS segs
                        ),

                        unnest_cte AS (
                            SELECT
                                rgs.uid,
                                rgs.corridor,
                                rgs.from_street,
                                rgs.to_street,
                                rgs.direction,
                                rgs.start_node,
                                rgs.end_node,
                                rgs.segment_list,
                                rgs.num_seg,
                                rgs.corridor_length,
                                unnest(rgs.segment_list) AS segment_id
                            FROM routing AS rgs
                        )

                        SELECT
                            uc.uid,
                            uc.corridor,
                            uc.from_street,
                            uc.to_street,
                            uc.direction,
                            uc.start_node,
                            uc.end_node,
                            uc.num_seg,
                            uc.segment_id,
                            uc.corridor_length,
                            cns.total_length AS seg_length, 
                            cns.geom
                        FROM unnest_cte AS uc
                        INNER JOIN congestion.network_segments AS cns
                            ON cns.segment_id = uc.segment_id'''


            agg_tt = '''WITH period_def(period_name, time_range, dow) AS (
                            VALUES 
                            ('AM Peak Period'::text, '[7, 10)'::numrange, '[1, 6)'::int4range), 
                            ('PM Peak Period'::text, '[16, 19)'::numrange, '[1, 6)'::int4range),
                            ('Weekend Midday'::text, '[12, 19)'::numrange, '[6, 8)'::int4range)
                        ),

                        -- Date range definition
                        date_def(range_name, date_range) AS (
                            VALUES
                            ('May 1 to July 31, 2020'::text, '[2020-05-01, 2020-07-31)'::daterange),
                            ('August 1 to September 6, 2021'::text, '[2021-08-01, 2021-09-06)'::daterange),
                            ('September 6 to December 31, 2021'::text, '[2021-09-06, 2021-12-31)'::daterange),
                            ('January 1 to June 30, 2022'::text, '[2022-01-01, 2022-06-30)'::daterange),
                            ('July 1 to December 31, 2022'::text, '[2022-07-01, 2022-12-31)'::daterange)
                        ),

                        -- Aggregate segments to corridor on a daily, hourly basis
                        corridor_hourly_daily_agg AS (

                            SELECT
                                routed.uid,
                                routed.corridor,
                                routed.from_street,
                                routed.to_street, 
                                routed.direction,
                                cn.dt,
                                cn.hr,
                                date_def.range_name, 
                                period_def.period_name,
                                routed.corridor_length,
                                SUM(cn.unadjusted_tt) AS corr_hourly_daily_tt

                            FROM data_requests.i0412_danforth_tt_geom AS routed 
                            JOIN congestion.network_segments_daily AS cn USING (segment_id)
                            CROSS JOIN period_def
                            CROSS JOIN date_def
                            LEFT JOIN ref.holiday AS holiday ON cn.dt = holiday.dt -- excluding holiday
                            WHERE   
                                cn.hr <@ period_def.time_range 
                                AND date_part('isodow'::text, cn.dt)::integer <@ period_def.dow  
                                AND holiday.dt IS NULL 
                                AND cn.dt <@ date_def.date_range

                            GROUP BY
                                routed.uid, 
                                routed.corridor, 
                                routed.from_street, 
                                routed.to_street, 
                                cn.dt, 
                                cn.hr,
                                period_def.period_name, 
                                date_def.range_name, 
                                routed.direction, 
                                routed.corridor_length

                            HAVING SUM(cn.length_w_data) >= routed.corridor_length*0.8 -- where corridor has at least 80% of links with data
                        ), 

                        -- Average the hours selected into daily period level data
                        corridor_period_daily_avg_tt AS ( 

                            SELECT
                                corridor_hourly_daily_agg.uid, 
                                corridor_hourly_daily_agg.dt, 
                                corridor_hourly_daily_agg.corridor, 
                                corridor_hourly_daily_agg.from_street, 
                                corridor_hourly_daily_agg.to_street, 
                                corridor_hourly_daily_agg.range_name, 
                                corridor_hourly_daily_agg.period_name, 
                                corridor_hourly_daily_agg.direction,
                                AVG(corridor_hourly_daily_agg.corr_hourly_daily_tt) AS avg_corr_period_daily_tt

                            FROM corridor_hourly_daily_agg 
                            GROUP BY 
                                corridor_hourly_daily_agg.dt, 
                                corridor_hourly_daily_agg.uid, 
                                corridor_hourly_daily_agg.corridor, 
                                corridor_hourly_daily_agg.from_street, 
                                corridor_hourly_daily_agg.to_street, 
                                corridor_hourly_daily_agg.range_name, 
                                corridor_hourly_daily_agg.period_name, 
                                corridor_hourly_daily_agg.direction
                        )

                        -- Average all the days with data to get period level data for each date range
                        SELECT 
                            corridor_period_daily_avg_tt.uid, 
                            corridor_period_daily_avg_tt.corridor, 
                            corridor_period_daily_avg_tt.from_street, 
                            corridor_period_daily_avg_tt.to_street, 
                            corridor_period_daily_avg_tt.range_name, 
                            corridor_period_daily_avg_tt.period_name, 
                            corridor_period_daily_avg_tt.direction,
                            COUNT(*) AS days_with_data,
                            ROUND(AVG(corridor_period_daily_avg_tt.avg_corr_period_daily_tt) / 60, 2) AS average_tt_min

                        FROM corridor_period_daily_avg_tt 
                        GROUP BY 
                            corridor_period_daily_avg_tt.uid, 
                            corridor_period_daily_avg_tt.corridor, 
                            corridor_period_daily_avg_tt.from_street, 
                            corridor_period_daily_avg_tt.to_street, 
                            corridor_period_daily_avg_tt.range_name, 
                            corridor_period_daily_avg_tt.period_name, 
                            corridor_period_daily_avg_tt.direction
                        ORDER BY 
                            corridor_period_daily_avg_tt.uid, 
                            corridor_period_daily_avg_tt.range_name, 
                            corridor_period_daily_avg_tt.period_name; '''



            cursor.execute(agg_tt, {"node_start": from_node_id, "node_end": to_node_id})
            records = cursor.fetchall()





    if request.json['file_type'] == 'csv':
        with open(filePath, 'w', newline='') as csvFile:
            fields = [
                'from_street','to_street','via_street', # geom
                'time_range','date_range','dow','holidays', # temporal
                'mean_travel_time' # data!
            ]
            csv_writer = csv.DictWriter( csvFile, fieldnames = fields )
            csv_writer.writeheader()
            for rand, in records:
                csv_writer.writerow({
                    'from_street': '',
                    'to_street': '',
                    'via_street': '',
                    'time_range': request.json['time_periods'][0], # like [{'start_time': '19:00', 'end_time': '20:00', 'name': 'new range'}]
                    'date_range': request.json['date_range'], # like '[1999-12-31, 2023-04-24]'
                    'dow': ','.join([ str(v) for v in request.json['days_of_week'] ]),
                    'holidays': request.json['holidays'],
                    'mean_travel_time': rand
                })
            csvFile.flush()
        mime_type = "text/csv"
    #elif file_type == 'xlsx':
    #    data_file_path = make_travel_data_xlsx(travel_data_list, columns)
    #    mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        abort(501, description="Currently only support csv files.")
        return

    file_response = send_file(filePath, mimetype=mime_type)
    return file_response


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