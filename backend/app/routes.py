import os
import json

from flask import abort, jsonify, request, send_file

from psycopg2 import connect, sql
from psycopg2.extras import execute_values

from app import app
from app.file_util import make_travel_data_csv, make_travel_data_xlsx
from app.models import Link, Node
from app.parse_util import *

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
    
    connection = getConnection()

    with connection:
        with connection.cursor() as cursor:
            select_sql = '''
                WITH distances AS (
                    SELECT 
                        node_id,
                        st_distance(
                            st_transform(geom, 2952),
                            st_transform(
                                st_setsrid(st_makepoint(%(longitude)s, %(latitude)s), 4326),
                                2952
                            )
                        ) AS distance
                    FROM here.routing_nodes_intersec_name
                )
                SELECT 
                    here_nodes.node_id::int,
                    intersec_name,
                    st_asgeojson(geom),
                    distance
                FROM here.routing_nodes_intersec_name AS here_nodes
                JOIN distances ON here_nodes.node_id = distances.node_id
                ORDER BY distance
                LIMIT 10'''
            cursor.execute(select_sql, {"latitude": latitude, "longitude": longitude})
            nodes_ascend_dist_order_query_result = cursor.fetchall()

    candidate_nodes = []
    node_count = 0
    for node_id, stname, coord_dict, distance in nodes_ascend_dist_order_query_result:
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


@app.route('/travel-data-file', methods=['POST'])
def get_links_travel_data_file():
    """
    Get the travel data file from start_time to end_time for all links in link_dirs.

    Caution: This function may take a long time if start_time - end_time is a long period of time, or link_dirs contains
            too many links. (1~2min)

    Assumptions: start_time, end_time are in res.json, and are formatted using DATE_TIME_FORMAT (%Y-%m-%d %H:%M:%S).
                link_dirs is in res.json, and is a list containing valid link_dir entries (string).
                file_type is in res.json, and is 'csv', 'xlsx' or 'shapefile'
    This function will be aborted if any of the assumption is not met.

    :return: a file containing requested travel data
    """
    file_type, columns = parse_file_type_request_body(request.json)
    trav_data_query_params = parse_travel_request_body(request.json)
    travel_data_list = parse_travel_data_query_result(trav_data_query_result, columns)

    if file_type == 'csv':
        data_file_path = make_travel_data_csv(travel_data_list, columns)
        mime_type = "text/csv"
    elif file_type == 'xlsx':
        data_file_path = make_travel_data_xlsx(travel_data_list, columns)
        mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        abort(501, description="Currently only support csv and xlsx files.")
        return

    file_response = send_file(data_file_path, mimetype=mime_type)
    if not _need_keep_temp_file():
        os.remove(data_file_path)
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