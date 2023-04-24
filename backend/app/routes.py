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


@app.route('/aggregate-travel-times', methods=['POST'])
def aggregate_travel_times():
    # results will be written to file here (random, non-conflicting filenames)
    filePath = f"{os.getcwd()}/tmp/{uuid()}.csv"
    print(request.json)

    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT length, mean, confidence FROM here.ta LIMIT 100')
            records = cursor.fetchall()

    if request.json['file_type'] == 'csv':
        with open(filePath, 'w', newline='') as csvFile:
            extraFields = ['segment','holidays','time_range','date_range']
            csv_writer = csv.DictWriter(
                csvFile,
                fieldnames = extraFields + request.json['columns']
            )
            csv_writer.writeheader()
            for (length,mean,confidence) in records:
                csv_writer.writerow({
                    'segment':'',
                    'holidays':request.json['holidays'],
                    'date_range': request.json['date_range'],
                    'time_range': request.json['time_periods'][0], # like [{'start_time': '19:00', 'end_time': '20:00', 'name': 'new range'}]

                    'mean_tt':length,
                    'min_tt':mean,
                    'max_tt':confidence
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