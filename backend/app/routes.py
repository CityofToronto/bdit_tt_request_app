import os

from flask import abort, jsonify, request, send_file
from sqlalchemy import func

from app import METER_UNIT_SRID
from app import app, db
from app.file_util import make_travel_data_csv, make_travel_data_xlsx
from app.models import Travel, Link, Node
from app.parse_util import *


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
    Get the closest nodes to the given longitude and latitude.
    This function uses database function get_closest_nodes to fetch series of closest nodes to the given
    longitude and latitude, sorted by ascending distance order.
    Only points with distance less than 5 are returned by this function.

    :param longitude: the longitude of the origin point
    :param latitude: the latitude of the origin point
    :return: JSON of an array containing the satisfying nodes.
            The array is sorted in ascending distance order. node object keys: node_id(int),
            geometry(geom{type(str), coordinates(list[int])}), name(str)
    """
    try:
        longitude = float(longitude)
        latitude = float(latitude)
    except ValueError or ArithmeticError:
        abort(400, description="Longitude and latitude must be decimal numbers!")
        return

    nodes_ascend_dist_order_query_result = db.session.query(func.get_closest_nodes(longitude, latitude))

    candidate_nodes = []
    node_count = 0
    for node_query_result in nodes_ascend_dist_order_query_result:
        node_data = parse_node_response(node_query_result[0])
        node_dist = node_data[0]
        node_json = node_data[1]

        if node_count == 0 or node_dist < 5:
            candidate_nodes.append(node_json)
        else:
            break

        node_count += 1

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

    shortest_link_query_result = db.session.query(func.get_links_btwn_nodes(from_node_id, to_node_id)).first()[0]
    shortest_link_data = parse_get_links_btwn_nodes_response(shortest_link_query_result)
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

    for i in range(len(node_ids) - 1):
        curr_node_id = node_ids[i]
        next_node_id = node_ids[i + 1]

        if curr_node_id == next_node_id:
            continue

        shortest_link_query_result = db.session.query(func.get_links_btwn_nodes(curr_node_id, next_node_id)).first()[0]
        shortest_link_data = parse_get_links_btwn_nodes_response(shortest_link_query_result)
        optimal_links_data_list.append(shortest_link_data)
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
    The timestamps are formatted by DATE_TIME_FORMAT ("%Y-%m-%d %H:%M").

    :return: JSON containing two fields: start_time and end_time
    """
    from app import FULL_DATE_TIME_FORMAT, DB_START_DATE

    return {"start_time": DB_START_DATE.strftime(FULL_DATE_TIME_FORMAT), "end_time": "2018-09-30 19:55"}


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


def _get_links_by_link_dirs(link_dirs):
    return [Link.query.filter_by(link_dir=link_dir).first() for link_dir in link_dirs]


def _get_srid_point(longitude, latitude):
    """
    Make a point at the given longitude and latitude with the SRID provided in the environment.
    Uses ST_SetSrid and ST_MakePoint.

    Assumption: There is a POSTGIS_GEOM_SRID field in the system environment (os.environ).

    :param longitude: the longitude of the point
    :param latitude: the latitude of the point
    :return: a point at the given longitude and latitude with srid in the environment
    """
    return func.ST_SetSrid(func.ST_MakePoint(longitude, latitude), int(os.environ['POSTGIS_GEOM_SRID']))


def _transform_to_meter_srid(original_point):
    """
    Transforms the original point to a new point using the METER_UNIT_SRID.

    :param original_point: the point to be transformed
    :return: original point with srid transformed to METER_UNIT_SRID
    """
    return func.ST_Transform(original_point, METER_UNIT_SRID)
