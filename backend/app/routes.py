import os

from flask import abort, jsonify, request, send_file
from sqlalchemy import func, and_

from app import app, db
from app.file_util import *
from app.models import Node, Travel
from app.parse_util import *

METER_UNIT_SRID = 26986


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
    Get the closest 10 nodes to the given longitude and latitude.
    This function converts geometry points to srid METER_UNIT_SRID(26986) point
    using ST_Transform and then calculate their distance in meters using ST_Distance.
    This function may not return an array of exact length 10 if there is less than 10 points
    in the database.

    :param longitude: the longitude of the origin point
    :param latitude: the latitude of the origin point
    :return: JSON of an array containing the 10 closest nodes (if there are more than 10 nodes).
            The array is sorted in ascending distance order. node object keys: node_id(int),
            geometry(geom{type(str), coordinates(list[int])})
    """
    origin_point = _get_srid_point(longitude, latitude)

    nodes_ascend_dist_order_query_result = Node.query \
        .with_entities(Node.node_id, Node.geom.ST_AsGeoJSON()) \
        .order_by(func.ST_Distance(func.ST_Transform(Node.geom, METER_UNIT_SRID),
                                   _transform_to_meter_srid(origin_point)).asc())

    ten_closest_nodes = []
    node_count = 0
    for node_data in nodes_ascend_dist_order_query_result:
        if node_count >= 10:
            break
        ten_closest_nodes.append(parse_node_response(node_data))
        node_count += 1

    return jsonify(ten_closest_nodes)


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
    except ValueError:
        abort(400, description="The node_ids should be integers!")

    if from_node_id == to_node_id:
        abort(400, description="Source node can not be the same as target node.")

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


# DEPRECATED
# @app.route('/travel-data', methods=['POST'])
# def get_links_travel_data():
#     """
#     Get the travel data from start_time to end_time for all links in link_dirs.
#
#     Caution: This function may take a long time if start_time - end_time is a long period of time, or link_dirs
#               contains too many links. (1~2min)
#
#     Assumptions: start_time, end_time are in res.json, and are formatted using DATE_TIME_FORMAT (%Y-%m-%d %H:%M:%S).
#                 link_dirs is in res.json, and is a list containing valid link_dir entries (string).
#     This function will be aborted if any of the assumption is not met.
#
#     :return: a JSON list containing all the travel data, sorted in ascending link_dir order then ascending time order.
#             Fields of travel objects in the list: confidence(int), length(int), link_dir(str), mean(float),
#             pct_50(int), stddev(float), tx(str)
#     """
#     start_time, end_time, link_dirs = parse_travel_request_body(request.json)
#     return jsonify(_get_travel_data_list(start_time, end_time, link_dirs))


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
    file_type = parse_file_type_request_body(request.json)
    time_periods, link_dirs = parse_travel_request_body(request.json)
    travel_data_list = _get_travel_data_list(time_periods, link_dirs)
    if file_type == 'csv':
        data_file_path = make_travel_data_csv(travel_data_list)
        mime_type = "text/csv"
    elif file_type == 'xlsx':
        data_file_path = make_travel_data_xlsx(travel_data_list)
        mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        abort(501, description="Currently only support csv files.")
        return

    file_response = send_file(data_file_path, mimetype=mime_type)
    if not _need_keep_temp_file():
        os.remove(data_file_path)
    return file_response


@app.route('/date-bounds', methods=['GET'])
def get_date_bounds():
    """
    Get the earliest timestamp and latest timestamp in the travel database.
    The timestamps are formatted by DATE_TIME_FORMAT ("%Y-%m-%d %H:%M:%S").

    Caution: This function takes some time to execute, as it needs to query through the whole travel database to fetch
            the date range. It is unlikely this function is needed in final production.

    :return: JSON containing two fields: start_time and end_time
    """
    earliest_travel_data = Travel.query.order_by(Travel.tx.asc()).first()
    latest_travel_data = Travel.query.order_by(Travel.tx.desc()).first()
    earliest_time = earliest_travel_data.tx
    latest_time = latest_travel_data.tx
    return {"start_time": str(earliest_time), "end_time": str(latest_time)}


def _get_travel_data_list(time_periods, link_dirs):
    """
    Get the travel data within all given time_periods for all links in link_dirs.

    Caution: This function may take a long time if the time sum of time_periods is a long period of time, or
            link_dirs contains too many links. (1~2min)

    :return: a python list containing all the travel data, sorted in ascending link_dir order then ascending time order.
            Fields of travel objects in the list: confidence(int), length(int), link_dir(str), mean(float), pct_50(int),
            stddev(float), tx(str)
    """
    travel_data_list = []

    for time_period in time_periods:
        start_time = time_period[0]
        end_time = time_period[1]
        print(start_time)
        print(end_time)
        travel_query_result = Travel.query \
            .filter(and_(start_time <= Travel.tx, Travel.tx <= end_time, Travel.link_dir.in_(link_dirs))) \
            .order_by(Travel.link_dir.asc(), Travel.tx.asc()).all()

        for travel_data in travel_query_result:
            travel_data_list.append(travel_data.json())

    return travel_data_list


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
