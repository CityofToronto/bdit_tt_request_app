import csv
import json
from datetime import datetime
from os import environ, remove, getcwd

from flask import abort, jsonify, request, send_file
from sqlalchemy import func, and_
import xlsxwriter
from app import app, db
from app.models import Node, Travel

METER_UNIT_SRID = 26986
DATE_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"
ALLOWED_FILE_TYPES = ['csv', 'xlsx']
TEMP_FILE_NAME = 'temp'


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
        ten_closest_nodes.append(_parse_node_response(node_data))
        node_count += 1

    return jsonify(ten_closest_nodes)


@app.route('/link-nodes/<from_node_id>/<to_node_id>', methods=['GET'])
def get_links_between_nodes(from_node_id, to_node_id):
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
    shortest_link_data = _parse_get_links_btwn_nodes_response(shortest_link_query_result)
    return jsonify(shortest_link_data)


@app.route('/travel-data', methods=['POST'])
def get_links_travel_data():
    """
    Get the travel data from start_time to end_time for all links in link_dirs.

    Caution: This function may take a long time if start_time - end_time is a long period of time, or link_dirs contains
            too many links. (1~2min)

    Assumptions: start_time, end_time are in res.json, and are formatted using DATE_TIME_FORMAT (%Y-%m-%d %H:%M:%S).
                link_dirs is in res.json, and is a list containing valid link_dir entries (string).
    This function will be aborted if any of the assumption is not met.

    :return: a JSON list containing all the travel data, sorted in ascending link_dir order then ascending time order.
            Fields of travel objects in the list: confidence(int), length(int), link_dir(str), mean(float), pct_50(int),
            stddev(float), tx(str)
    """
    start_time, end_time, link_dirs = _parse_travel_request_body(request.json)
    return jsonify(_get_travel_data_list(start_time, end_time, link_dirs))


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
    file_type = _parse_file_type_request_body(request.json)
    start_time, end_time, link_dirs = _parse_travel_request_body(request.json)
    travel_data_list = _get_travel_data_list(start_time, end_time, link_dirs)

    if file_type == 'csv':
        data_file_path = _make_travel_data_csv(travel_data_list)
    elif file_type == 'xlsx':
        data_file_path = _make_travel_data_xlsx(travel_data_list)
    else:
        abort(501, description="Currently only support csv files.")
        return

    file_response = send_file(data_file_path)
    remove(data_file_path)
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


def _make_travel_data_xlsx(travel_data_list):
    """
    Make an xlsx file containing all the travel data in order.
    The xlsx file's first row is the header containing column names 'link_dir', 'tx', 'length', 'mean', 'stddev',
    'confidence', 'pct_50'.

    :param travel_data_list: the list of travel data
    :return: the file path of the xlsx file
    """
    filename = "%s.xlsx" % TEMP_FILE_NAME
    file_path = _make_temp_file_path(filename)
    travel_data_workbook = xlsxwriter.Workbook(file_path)
    travel_data_worksheet = travel_data_workbook.add_worksheet()

    travel_data_fields = ['link_dir', 'tx', 'length', 'mean', 'stddev', 'confidence', 'pct_50']
    for i in range(len(travel_data_fields)):
        travel_data_worksheet.write(0, i, travel_data_fields[i])

    row = 1
    col = 0
    for travel_data in travel_data_list:
        for i in range(len(travel_data_fields)):
            travel_data_worksheet.write(row, col + i, travel_data[travel_data_fields[i]])

        row += 1

    travel_data_workbook.close()
    return file_path


def _make_travel_data_csv(travel_data_list):
    """
    Make a csv file containing all the travel data in order.
    The csv has headers 'link_dir', 'tx', 'length', 'mean', 'stddev', 'confidence', 'pct_50'.

    :param travel_data_list: the list of travel data
    :return: the file path of the csv file
    """
    filename = "%s.csv" % TEMP_FILE_NAME
    file_path = _make_temp_file_path(filename)

    with open(file_path, 'w', newline='') as csvfile:
        travel_data_fields = ['link_dir', 'tx', 'length', 'mean', 'stddev', 'confidence', 'pct_50']
        csv_writer = csv.DictWriter(csvfile, fieldnames=travel_data_fields)

        csv_writer.writeheader()
        for travel_data in travel_data_list:
            csv_writer.writerow(travel_data)

        csvfile.flush()

    return file_path


def _get_travel_data_list(start_time, end_time, link_dirs):
    """
    Get the travel data from start_time to end_time for all links in link_dirs.

    Caution: This function may take a long time if start_time - end_time is a long period of time, or link_dirs contains
            too many links. (1~2min)

    :return: a python list containing all the travel data, sorted in ascending link_dir order then ascending time order.
            Fields of travel objects in the list: confidence(int), length(int), link_dir(str), mean(float), pct_50(int),
            stddev(float), tx(str)
    """
    travel_query_result = Travel.query \
        .filter(and_(start_time <= Travel.tx, Travel.tx <= end_time, Travel.link_dir.in_(link_dirs))) \
        .order_by(Travel.link_dir.asc(), Travel.tx.asc()).all()

    travel_data_list = []
    for travel_data in travel_query_result:
        travel_data_list.append(travel_data.json())

    return travel_data_list


def _parse_file_type_request_body(file_request_data):
    """
    Parse the request body that contains a file type definition.
    The file type should be specified in the request body JSON's field file_type.

    If the file type specified in the request body is not an valid and allowed file type, the first file type defined
    in the ALLOWED_FILE_TYPES is used by default (csv by default).

    :param file_request_data: the request body json
    :return: The first allowed file type (csv by default) if the file type specified in the request body JSON is
            invalid or not allowed; return the specified file type otherwise.
    """
    if 'file_type' not in file_request_data:
        return ALLOWED_FILE_TYPES[0]

    given_file_type = file_request_data['file_type']

    if given_file_type not in ALLOWED_FILE_TYPES:
        return ALLOWED_FILE_TYPES[0]

    return given_file_type


def _make_temp_file_path(filename):
    """
    Make a file path string for the temporary file.
    The location of the temporary file is defined in the system environment field TEMP_FILE_LOCATION
    If it starts with '/', it represents an absolute path to the folder storing temporary files.
    Otherwise, the system environment path is the relative path to the current working directory.

    :param filename: the filename of the temporary file
    :return: a full path to the temporary file
    """
    temp_file_folder_name = environ['TEMP_FILE_LOCATION']

    if temp_file_folder_name.startswith('/'):
        temp_file_path = "%s/%s" % (temp_file_folder_name, filename)
    else:
        temp_file_path = "%s/%s/%s" % (getcwd(), temp_file_folder_name, filename)

    return temp_file_path


def _parse_travel_request_body(travel_request_data):
    """
    Parse the body of a travel data request (POST request body).
    There should be three fields existing in the request body: start_time, end_time and link_dirs.
    start_time and end_time represent the time interval to query.
    link_dirs should be a list containing all the interested link's link_dir.

    Assumptions: start_time, end_time are in request body, and are formatted using DATE_TIME_FORMAT (%Y-%m-%d %H:%M:%S).
                link_dirs is in request body, and is a list containing valid link_dir entries (string).
    This function will call abort with response code 400 and error messages if any of the assumption is not met.

    :param travel_request_data: The raw request body
    :return: a tuple of (start_time, end_time, link_dirs)
    """
    # ensures existence of required fields
    if 'start_time' not in travel_request_data or 'end_time' not in travel_request_data or \
            'link_dirs' not in travel_request_data:
        abort(400, description="Request body must contain start_time, end_time and link_dirs.")

    start_time = travel_request_data['start_time']
    end_time = travel_request_data['end_time']
    link_dirs = travel_request_data['link_dirs']

    # ensures format of timestamp
    try:
        datetime.strptime(start_time, DATE_TIME_FORMAT)
        datetime.strptime(end_time, DATE_TIME_FORMAT)
    except ValueError:
        abort(400, description=("Start time and end time must follow date time format: %s" % DATE_TIME_FORMAT))

    # ensures link_dirs has the right type
    if type(link_dirs) != list:
        abort(400, description="link_dirs must be a list of link_dir to fetch travel data from!")

    return start_time, end_time, link_dirs


def _parse_link_response(link_data):
    """
    Parse the given Link query result to a dictionary that can be jsonify-ed.
    The received the link_data should have all columns in Link model in a tuple.
    The link_data should contain the following fields (in order):
        link_dir(str), link_id(int), st_name(str), source(int), target(int),
        length(float), geometry(geom{type(str), coordinates(list)})

    :param link_data: the query result from the Link table in the database
    :return: a dictionary containing the attributes (except id)
            for the Link query that can be jsonify-ed.
    """
    return {"link_dir": link_data[0], "link_id": link_data[1], "st_name": link_data[2],
            "source": link_data[3], "target": link_data[4], "length": link_data[5],
            "geometry": json.loads(link_data[6])}


def _convert_wkb_geom_to_json(wkb_geom):
    """
    Take a geom in wkb binary format and convert it to a JSON object

    :param wkb_geom: the wkb binary of the geom
    :return: a JSON representation of the wkb geom
    """
    geom_object = db.session.query(func.ST_AsGeoJSON(wkb_geom)).first()[0]
    return json.loads(geom_object)


def _parse_get_links_btwn_nodes_response(response: str):
    """
    Converts the string result from database function get_links_btwn_nodes to a dictionary that can be jsonify-ed.
    This function will call abort with response code 400 if the geometry in the response is empty, i.e. no link exists
    between the given two nodes.

    :param response: the string response from database function get_links_btwn_nodes
    :return: a dictionary that can be jsonify-ed. It contains the following fields:
            source(int), target(int), link_dirs(list[str]), geometry(geom{type(str), coordinates(list)})
    """
    # split the response string by the last comma, which splits source, target, link_dirs from geometry
    try:
        wkb_str_split = response.rindex(',"{"')
    except ValueError:
        abort(400, description="There is no valid link between the two nodes provided!")
        return

    wkb_str = response[wkb_str_split + 1:-1].replace('""', '"').rstrip('"').lstrip('"')
    geom_json = json.loads(wkb_str)

    source_target_links_str = response[:wkb_str_split] + ')'
    # if there is only one link between nodes, need to add double quotes to enforce same formatting as multi-link
    if source_target_links_str[-2] != '"' and source_target_links_str[-2] != "'":
        source_target_links_str = source_target_links_str.replace('{', '"{')
        source_target_links_str = source_target_links_str.replace('}', '}"')

    # cast the curly bracket surrounded raw link_dir list to a square bracket surrounds quoted link_dir list
    # so that the link_dirs can be casted to a string list
    source_target_links_tuple = eval(source_target_links_str)
    link_dirs_str = source_target_links_tuple[2]  # type: str
    link_dirs_str = link_dirs_str.replace('{', '["')
    link_dirs_str = link_dirs_str.replace('}', '"]')
    link_dirs_str = link_dirs_str.replace(',', '","')
    link_dirs = eval(link_dirs_str)

    return {"source": source_target_links_tuple[0], "target": source_target_links_tuple[1],
            "link_dirs": link_dirs, "geometry": geom_json}


def _parse_node_response(node_data):
    """
    Parse the given Node query result to a dictionary that can be jsonify-ed.
    The received the node_data should have all columns in Node model in a tuple.
    The link_data should contain the following fields (in order):
        node_id(int), geometry(geom{type(str), coordinates(list[int, int])})

    :param node_data: the query result from the Node table in the database
    :return: a dictionary containing the attributes for the Node query that can be jsonify-ed.
    """
    return {"node_id": node_data[0], "geometry": json.loads(node_data[1])}


def _get_srid_point(longitude, latitude):
    """
    Make a point at the given longitude and latitude with the SRID provided in the environment.
    Uses ST_SetSrid and ST_MakePoint.

    Assumption: There is a POSTGIS_GEOM_SRID field in the system environment (os.environ).

    :param longitude: the longitude of the point
    :param latitude: the latitude of the point
    :return: a point at the given longitude and latitude with srid in the environment
    """
    return func.ST_SetSrid(func.ST_MakePoint(longitude, latitude), int(environ['POSTGIS_GEOM_SRID']))


def _transform_to_meter_srid(original_point):
    """
    Transforms the original point to a new point using the METER_UNIT_SRID.

    :param original_point: the point to be transformed
    :return: original point with srid transformed to METER_UNIT_SRID
    """
    return func.ST_Transform(original_point, METER_UNIT_SRID)


def _get_node_by_id(node_id: str):
    """
    Get the node query result given its node_id.
    This function will call abort with response code 400 if the given node_id
    can not be cast to an integer.

    :param node_id: the node_id of the target node
    :return: the node that corresponds to the node_id
    """
    try:
        node_id_int = int(node_id)
    except ValueError:
        abort(400, description="Node id must be an integer!")
        return

    node_query_result = Node.query \
        .filter(Node.node_id == node_id_int) \
        .first()
    return node_query_result
