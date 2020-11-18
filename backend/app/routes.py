import os
from datetime import timedelta
from math import sqrt

from flask import abort, jsonify, request, send_file
from sqlalchemy import func, and_

from app import METER_UNIT_SRID, DATE_TIME_FORMAT
from app import app, db
from app.file_util import make_travel_data_csv, make_travel_data_xlsx
from app.models import Node, Travel, Link
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
    file_type, file_args = parse_file_type_request_body(request.json)
    time_periods, link_dirs = parse_travel_request_body(request.json)
    travel_data_list = _get_travel_data_list(time_periods, link_dirs)

    if file_type == 'csv':
        data_file_path = make_travel_data_csv(travel_data_list)
        mime_type = "text/csv"
    elif file_type == 'xlsx':
        data_file_path = make_travel_data_xlsx(travel_data_list, file_args)
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


class _TravelDataTimePeriodBlock:
    def __init__(self, start_time, end_time, interval_time):
        self._start_time = start_time
        self._end_time = end_time
        self._interval_time = interval_time
        time_diff = end_time - start_time  # type: timedelta
        self._size = _round_up(time_diff.total_seconds() / interval_time)
        self._intervals = [{'all_means': [], 'all_variances': [], 'all_confidences': [], 'all_pct_50s': []}
                           for _ in range(self._size)]

    def get_seconds_interval(self):
        return self._interval_time

    def register_data(self, travel_data_obj):
        time_diff = travel_data_obj.tx - self._start_time  # type: timedelta
        slot = int(time_diff.total_seconds() // self._interval_time)
        travel_data = travel_data_obj.json()
        self._intervals[slot]['all_means'].append(travel_data['mean'])
        self._intervals[slot]['all_variances'].append(travel_data['stddev'] ** 2)
        self._intervals[slot]['all_confidences'].append(travel_data['confidence'])
        self._intervals[slot]['all_pct_50s'].append(travel_data['pct_50'])

    def get_mean_data_list(self, seg_i: int, from_street: str, to_street: str, path_str: str, links_length: float,
                           travel_data_length: float):
        data = []
        curr_start_time = self._start_time

        for interval in self._intervals:
            curr_end_time = min(curr_start_time + timedelta(seconds=self._interval_time), self._end_time)

            data.append({
                'seg_i': seg_i,
                'from_street': from_street,
                'to_street': to_street,
                'path_str': path_str,
                'from_tx': curr_start_time.strftime(DATE_TIME_FORMAT),
                'to_tx': curr_end_time.strftime(DATE_TIME_FORMAT),
                'links_length': links_length,
                'data_length': travel_data_length,
                'mean_spd': round(_calc_list_avg(interval['all_means']), 2),
                'mean_stddev': round(sqrt(_calc_list_avg(interval['all_variances'])), 2),
                'mean_confidence': round(_calc_list_avg(interval['all_confidences']), 2),
                'mean_pct_50': round(_calc_list_avg(interval['all_pct_50s']), 2)
            })

            curr_start_time = curr_end_time

        return data

    def __len__(self):
        return self._size


def _get_travel_data_list(list_of_time_periods, list_of_link_dirs):
    """
    Get the travel data within all given time_periods for all segments of links in list_of_link_dirs.

    Caution: This function may take a long time if the time sum of time_periods is a long period of time, or
            the segments of link_dirs contains too many links. (1~2min)

    :return: a python list containing all the segments. Each segment contains a list of its data, where each index
            corresponds to a given time period.
    """
    travel_data_result = []

    segment_count = 0
    for link_dirs in list_of_link_dirs:
        segment_data = []

        links = _get_links_by_link_dirs(link_dirs)
        st_names = get_path_list_from_link_list(links)
        from_street = st_names[0]
        to_street = st_names[-1]
        path_str = "->".join(st_names)
        links_length = round(sum([float(link.length) for link in links]), 2)
        visited_links = []
        travel_data_length = 0

        for time_periods in list_of_time_periods:
            data_count = 0
            need_sum_travel_data_length = travel_data_length == 0

            for time_period in time_periods:
                start_time = time_period[0]
                end_time = time_period[1]
                tp_data = _TravelDataTimePeriodBlock(start_time, end_time, 3600)

                travel_query_result = Travel.query \
                    .filter(and_(start_time <= Travel.tx, Travel.tx < end_time, Travel.link_dir.in_(link_dirs))) \
                    .order_by(Travel.link_dir.asc(), Travel.tx.asc()).all()

                for travel_data_obj in travel_query_result:
                    travel_data = travel_data_obj.json()

                    curr_link_dir = travel_data['link_dir']
                    if need_sum_travel_data_length and curr_link_dir not in visited_links:
                        visited_links.append(curr_link_dir)
                        travel_data_length = round(travel_data['length'] + travel_data_length, 2)

                    tp_data.register_data(travel_data_obj)
                    data_count += 1

                segment_data.extend(
                    tp_data.get_mean_data_list(segment_count, from_street, to_street, path_str, links_length,
                                               travel_data_length))

        travel_data_result.append(segment_data)
        segment_count += 1

    return travel_data_result


def _split_datetime_interval(start_datetime, end_datetime):
    intervals = []
    curr_datetime = start_datetime
    while True:
        next_datetime = start_datetime + timedelta(hours=1)

        if next_datetime >= end_datetime:
            intervals.append((curr_datetime, min(next_datetime, end_datetime)))
            break

        intervals.append((curr_datetime, next_datetime))
        curr_datetime = next_datetime

    return intervals


def _calc_list_avg(lst: list) -> float:
    if len(lst) == 0:
        return 0.0
    return sum(lst) / len(lst)


def _round_up(num: float):
    result = int(num)
    if num - result > 0:
        result += 1
    return result


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
