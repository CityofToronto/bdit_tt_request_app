import os
import json

from flask import abort, jsonify, request, send_file
from sqlalchemy import func

from psycopg2 import connect, sql
from psycopg2.extras import execute_values

from app import app, db
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
    return "Data Filter Web Application"


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
    """
    Get the shortest length link between the two given nodes.
    This function filters links using ST_Intersects and sort them using the
    length attribute of the link object.
    This function will call abort with response code 400 when the given node_ids
    can not be cast to an integer, the two nodes given are the same or no link exists between the two nodes.

    :param from_node_id: source node id
    :param to_node_id: target node id
    :return: JSON representing a link object, which is the shortest link between
            the two points. Link object keys: link_dir(str), link_id(int), st_name(str),
            source(int), target(int), length(float),
            geometry(geom{type(str), coordinates(list[int])})
    """
    try:
        from_node_id = int(from_node_id)
        to_node_id = int(to_node_id)
    except ValueError or ArithmeticError:
        abort(400, description="The node_ids should be integers!")
        return

    if from_node_id == to_node_id:
        abort(400, description="Source node can not be the same as target node.")
        return


    # shortest_link_query_result = db.session.query(func.get_links_btwn_nodes(from_node_id, to_node_id)).first()[0]

    connection = getConnection()

    with connection:
        with connection.cursor() as cursor:
            #Uses pg_routing to route between the start node and end node on the HERE
            #links network. Returns inputs and an array of link_dirs and a unioned line
            select_sql = '''
                WITH results as (
                    SELECT *
                    FROM pgr_dijkstra(
                        'SELECT id, source::int, target::int, length::int as cost from here.routing_streets_name', %(node_start)s,
                            %(node_end)s)
                )

                SELECT %(node_start)s, %(node_end)s, array_agg(st_name),array_agg(link_dir), ST_AsGeoJSON(ST_union(ST_linemerge(geom))) as geometry
                FROM results
                inner join here.routing_streets_name on edge = id'''
            cursor.execute(select_sql, {"node_start": from_node_id, "node_end": to_node_id})
            source, target, path, link_dirs, geometry = cursor.fetchall()[0]
            print(type(geometry))

        # parsing query result
        # shortest_link_data = parse_get_links_btwn_nodes_response(str(shortest_link_query_result))


    shortest_link_data = {"source": source, "target": target,
        "path_name": str(path), "link_dirs": link_dirs, "geometry": json.loads(geometry)}

    connection.close()
    
    return jsonify(shortest_link_data)


@app.route('/link-nodes', methods=['POST'])
def get_links_between_multi_nodes():
    """
    Get the shortest length link connecting the given nodes in order.
    This function filters links using ST_Intersects and sort them using the
    length attribute of the link object.
    If any two consecutive nodes in the list are the same, they are skipped.
    This function will call abort with response code 400 when the given node_ids can not be cast to an integer
    or no link exists between the two nodes.

    :return: JSON representing an array of link objects, which are the shortest links connecting given points.
            Link object keys: link_dir(str), link_id(int), st_name(str),
            source(int), target(int), length(float),
            geometry(geom{type(str), coordinates(list[int])})
    """
    node_ids = parse_get_links_between_multi_nodes_request_body(request.json)
    optimal_links_data_list = []

    connection = getConnection()

    for i in range(len(node_ids) - 1):
        curr_node_id = node_ids[i]
        next_node_id = node_ids[i + 1]

        if curr_node_id == next_node_id:
            continue

        # shortest_link_query_result = db.session.query(func.get_links_btwn_nodes(curr_node_id, next_node_id)).first()[0]


        with connection:
            with connection.cursor() as cursor:
                #Uses pg_routing to route between the start node and end node on the HERE
                #links network. Returns inputs and an array of link_dirs and a unioned line
                select_sql = '''
                    WITH results as (
                        SELECT *
                        FROM pgr_dijkstra(
                            'SELECT id, source::int, target::int, length::int as cost from here.routing_streets_name', %(node_start)s,
                                %(node_end)s)
                    )

                    SELECT %(node_start)s, %(node_end)s, array_agg(st_name),array_agg(link_dir), ST_AsGeoJSON(ST_union(ST_linemerge(geom))) as geometry
                    FROM results
                    inner join here.routing_streets_name on edge = id'''
                cursor.execute(select_sql, {"node_start": curr_node_id, "node_end": next_node_id})
                source, target, path, link_dirs, geometry = cursor.fetchall()[0] 

        # parsing query result
        # shortest_link_data = parse_get_links_btwn_nodes_response(str(shortest_link_query_result))


        shortest_link_data = {"source": source, "target": target,
            "path_name": str(path), "link_dirs": link_dirs, "geometry": json.loads(geometry)}
        optimal_links_data_list.append(shortest_link_data)

    connection.close()
    return jsonify(optimal_links_data_list)


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
    street_info = _get_street_info(request.json['list_of_links'])  # this won't fail since last parse already checked
    trav_data_query_result = db.session.query(func.fetch_trav_data_wrapper(*trav_data_query_params)).all()
    travel_data_list = parse_travel_data_query_result(trav_data_query_result, columns, street_info)

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


def _calc_list_avg(lst: list) -> float:
    if len(lst) == 0:
        return 0.0
    return sum(lst) / len(lst)


def _round_up(num: float):
    result = int(num)
    if num - result > 0:
        result += 1
    return result


def _get_street_info(list_of_link_dirs):
    street_info = {}

    for i in range(len(list_of_link_dirs)):
        link_dirs = list_of_link_dirs[i]

        start_link = Link.query.filter_by(link_dir=link_dirs[0]).first()
        end_link = Link.query.filter_by(link_dir=link_dirs[-1]).first()

        start_node = Node.query.filter_by(node_id=int(start_link.source)).first()
        end_node = Node.query.filter_by(node_id=int(end_link.target)).first()

        start_node_name = str(start_node.intersec_name)
        end_node_name = str(end_node.intersec_name)

        start_names = start_node_name.split(" & ")
        end_names = end_node_name.split(" & ")

        intersections = []
        for s_name in start_names:
            if s_name in end_names:
                intersections.append(s_name)

        if len(intersections) > 0:
            for intersec in intersections:
                start_names.remove(intersec)
                end_names.remove(intersec)

            intersection = " & ".join(intersections)

            if len(start_names) > 0:
                from_street = " & ".join(start_names)
            else:
                from_street = " & ".join(intersections)

            if len(end_names) > 0:
                to_street = " & ".join(end_names)
            else:
                to_street = " & ".join(intersections)
        else:
            intersection = "<multiple streets>"
            from_street = start_node_name
            to_street = end_node_name

        street_info[i] = (intersection, from_street, to_street)

    return street_info
