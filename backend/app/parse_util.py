import json
from datetime import datetime

from flask import abort

DATE_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"
ALLOWED_FILE_TYPES = ['csv', 'xlsx']

__all__ = ['parse_file_type_request_body', 'parse_travel_request_body', 'parse_link_response',
           'parse_get_links_btwn_nodes_response', 'parse_node_response']


def parse_file_type_request_body(file_request_data):
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


def parse_travel_request_body(travel_request_data):
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


def parse_link_response(link_data):
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


def parse_get_links_btwn_nodes_response(response: str):
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


def parse_node_response(node_data):
    """
    Parse the given Node query result to a dictionary that can be jsonify-ed.
    The received the node_data should have all columns in Node model in a tuple.
    The link_data should contain the following fields (in order):
        node_id(int), geometry(geom{type(str), coordinates(list[int, int])})

    :param node_data: the query result from the Node table in the database
    :return: a dictionary containing the attributes for the Node query that can be jsonify-ed.
    """
    return {"node_id": node_data[0], "geometry": json.loads(node_data[1])}
