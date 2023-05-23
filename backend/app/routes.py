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


#@app.route('/aggregate-travel-times', methods=['POST'])
#def aggregate_travel_times():
#
#
# aggregate_travel_times(segment_list, time_range, date_range)
#
#
@app.route('/aggregate-travel-times/<segment_list>/<time_range>/<date_range>', methods=['GET'])
def aggregate_travel_times(segment_list, time_range, date_range):
    # results will be written to file here (random, non-conflicting filenames)
    # here_22_2 -> linkdir -> segment_links -> network_segments
    filePath = f"{os.getcwd()}/tmp/{uuid()}.csv"
    print(request.json)

    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            # corridor_length = '''SELECT SUM(length)
            #                         FROM here.routing_streets_22_2
            #                         WHERE link_id IN %(segment_list)s 
            #                 '''
            
            agg_tt = '''
                        unnest_cte AS (
                            SELECT
                                array_length(segs.segment_list, 1) AS num_seg,
                                rgs.corridor_length,
                                unnest(rgs.segment_list) AS segment_id
                            FROM routing AS rgs
                        ),

                        routed AS (
                            SELECT
                                uc.num_seg,
                                uc.segment_id,
                                uc.corridor_length,
                                cns.total_length AS seg_length, 
                                cns.geom
                            FROM unnest_cte AS uc
                            INNER JOIN congestion.network_segments AS cns
                                ON cns.segment_id = uc.segment_id
                        ),


                        period_def(period_name, time_range, dow) AS (
                            VALUES 
                            ('AM Peak Period'::text, '[7, 10)'::numrange, '[1, 6)'::int4range)
                        ),

                        -- Date range definition
                        date_def(range_name, date_range) AS (
                            VALUES
                            ('May 1 to July 31, 2020'::text, '[2020-05-01, 2020-07-31)'::daterange)
                        ),

                        -- Aggregate segments to corridor on a daily, hourly basis
                        corridor_hourly_daily_agg AS (

                            SELECT
                                cn.dt,
                                cn.hr,
                                date_def.range_name, 
                                period_def.period_name,
                                routed.corridor_length,
                                SUM(cn.unadjusted_tt) AS corr_hourly_daily_tt

                            FROM routed 
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
                                cn.dt, 
                                cn.hr,
                                period_def.period_name, 
                                date_def.range_name, 
                                routed.corridor_length

                            HAVING SUM(cn.length_w_data) >= routed.corridor_length*0.8 -- where corridor has at least 80% of links with data
                        ), 

                        -- Average the hours selected into daily period level data
                        corridor_period_daily_avg_tt AS ( 

                            SELECT
                                dt, 
                                range_name, 
                                period_name, 
                                AVG(corr_hourly_daily_tt) AS avg_corr_period_daily_tt

                            FROM corridor_hourly_daily_agg 
                            GROUP BY 
                                dt, 
                                range_name, 
                                period_name
                        )

                        -- Average all the days with data to get period level data for each date range
                        SELECT 
                            range_name, 
                            period_name,
                            COUNT(*) AS days_with_data,
                            ROUND(AVG(avg_corr_period_daily_tt) / 60, 2) AS average_tt_min

                        FROM corridor_period_daily_avg_tt 
                        GROUP BY 
                            range_name, 
                            period_name
                        ORDER BY 
                            range_name,
                            period_name; '''



            cursor.execute(agg_tt, {"segment_list": segment_list, "time_range": time_range, "date_range": date_range})
            records = cursor.fetchall()
            return records


    # if request.json['file_type'] == 'csv':
    #     with open(filePath, 'w', newline='') as csvFile:
    #         fields = [
    #             'from_street','to_street','via_street', # geom
    #             'time_range','date_range','dow','holidays', # temporal
    #             'mean_travel_time' # data!
    #         ]
    #         csv_writer = csv.DictWriter( csvFile, fieldnames = fields )
    #         csv_writer.writeheader()
    #         for rand, in records:
    #             csv_writer.writerow({
    #                 'time_range': request.json['time_periods'][0], # like [{'start_time': '19:00', 'end_time': '20:00', 'name': 'new range'}]
    #                 'date_range': request.json['date_range'], # like '[1999-12-31, 2023-04-24]'
    #                 'dow': ','.join([ str(v) for v in request.json['days_of_week'] ]),
    #                 'holidays': request.json['holidays'],
    #                 'mean_travel_time': rand
    #             })
    #         csvFile.flush()
    #     mime_type = "text/csv"
    # #elif file_type == 'xlsx':
    # #    data_file_path = make_travel_data_xlsx(travel_data_list, columns)
    # #    mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    # else:
    #     abort(501, description="Currently only support csv files.")
    #     return

    # file_response = send_file(filePath, mimetype=mime_type)
    # return file_response


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