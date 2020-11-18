import json
from datetime import datetime, timedelta

from flask import abort

from app import DATE_TIME_FORMAT, ALLOWED_FILE_TYPES

__all__ = ['parse_file_type_request_body', 'parse_travel_request_body', 'parse_link_response',
           'parse_get_links_btwn_nodes_response', 'parse_node_response', 'parse_time_periods',
           'parse_get_links_between_multi_nodes_request_body', 'get_path_list_from_link_list']


def parse_file_type_request_body(file_request_data):
    """
    Parse the request body that contains a file type and arguments.
    The file type should be specified in the request body JSON's field file_type.
    The file argument should be a string.

    If the file type specified in the request body is not an valid and allowed file type, the first file type defined
    in the ALLOWED_FILE_TYPES is used by default (csv by default).

    Caution: If file type is invalid, file arguments will be automatically ignored.

    :param file_request_data: the request body json
    :return: A tuple of file info. First index is the first allowed file type (csv by default) if the file type
            specified in the request body JSON is invalid or not allowed, or the specified file type otherwise.
            Second index is a string representing file arguments (None if does not exist)
    """
    if 'file_type' not in file_request_data:
        return ALLOWED_FILE_TYPES[0], None

    given_file_type = file_request_data['file_type']

    if given_file_type not in ALLOWED_FILE_TYPES:
        return ALLOWED_FILE_TYPES[0], None

    if 'file_args' not in file_request_data or type(file_request_data['file_args']) != str:
        return given_file_type, None

    return given_file_type, file_request_data['file_args']


def parse_get_links_between_multi_nodes_request_body(nodes_data):
    """
    Parse the request body that contains a list of node_ids.
    This function will call abort with response code 400 and error messages if any of the node_id is not an integer, or
    if field 'node_ids' does not exist in the request body, or if field 'node_ids' is not a list with minimum length 2.

    :param nodes_data: the body of the get_links_between_multi_nodes request
    :return: a list of integer node ids
    """
    try:
        if 'node_ids' not in nodes_data:
            abort(400, description="Must provide a list of node_ids")
            return
    except TypeError:
        abort(400,
              description="Request body of get_links_between_multi_nodes must be a JSON containing field 'node_ids'")
        return

    node_id_list = nodes_data['node_ids']
    if type(node_id_list) != list or len(node_id_list) < 2:
        abort(400, description="Field 'node_ids' must be a list of at least 2 node ids.")
        return

    node_ids = []
    for node_id in node_id_list:
        try:
            node_id_int = int(node_id)
        except ArithmeticError:
            abort(400, description='node_id must be an integer.')
            return

        node_ids.append(node_id_int)

    return node_ids


def parse_travel_request_body(travel_request_data):
    """
    Parse the body of a travel data request (POST request body).

    Assumptions: The following fields should exist in the request body: list_of_time_periods and list_of_links.

    This function will call abort with response code 400 and error messages if it fails to parse travel request data.

    :param travel_request_data: The raw request body
    :return: a tuple of (list of time periods, list of link_dirs)
    """
    # ensures existence of required fields
    if 'list_of_time_periods' not in travel_request_data or 'list_of_links' not in travel_request_data:
        abort(400, description="Request body must contain list_of_time_periods and list_of_links.")
        return

    try:
        list_of_time_periods = list(travel_request_data['list_of_time_periods'])
        list_of_link_dirs = list(travel_request_data['list_of_links'])
    except TypeError:
        abort(400, description="both list_of_links and time_periods must be lists!")
        return

    parsed_datetime_periods = parse_time_periods(list_of_time_periods)
    parsed_list_of_link_dirs = [[str(link_dir) for link_dir in link_dir_lst] for link_dir_lst in list_of_link_dirs]
    return parsed_datetime_periods, parsed_list_of_link_dirs


def parse_time_periods(tps_data):
    """
    Parse a list containing raw time period data into a list of usable time periods.

    Assumptions: The following fields should exist in each of the list entry: start_date, end_date, start_time,
                    end_time, days_of_week, and include_holidays
                    start_date and end_date are date strings in format %Y-%m-%d
                    start_time and end_time are time strings in format %H:%M:%S
                    days_of_week should be a length-7 list of boolean values (0 is Monday, 6 is Sunday), representing
                    which days to include.
                    include_holidays should be a boolean value representing whether or not to include holidays

    This function will call abort with response code 400 and error messages if any of the assumption is not met.

    :param tps_data: list containing all raw time period data
    :return: a list of tuple of (time_periods, link_dirs)
    """
    tp_required = ['start_date', 'end_date', 'start_time', 'end_time', 'days_of_week', 'include_holidays']
    tps_parsed = []
    for tp_raw in tps_data:
        if type(tp_raw) != dict:
            abort(400, description="Each time period must be a dictionary (JSON)!")
            return

        if False in [field in tp_raw for field in tp_required]:
            abort(400,
                  description="Each time period must contain start_date, end_date, start_time, end_time, days_of_week, "
                              "and include_holidays.")
            return

        try:
            start_date = str(tp_raw['start_date'])
            end_date = str(tp_raw['end_date'])
            start_time = str(tp_raw['start_time'])
            end_time = str(tp_raw['end_time'])
            days_of_week = list(tp_raw['days_of_week'])
            # TODO: utilize holidays
            include_holidays = bool(tp_raw['include_holidays'])
        except TypeError:
            abort(400, description="start_date, end_date, start_time, end_time should be str. days_of_week should be "
                                   "a list. include_holidays should be a bool!")
            return

        if len(days_of_week) != 7:
            abort(400, description="days_of_week list must have length 7 (one bool val for each day in the week)!")
            return

        tp_parsed = []
        try:
            start_t = int(start_time.replace(":", ""))
            end_t = int(end_time.replace(":", ""))

            if start_t >= end_t:
                abort(400, description="start time must not be later than end time!")
                return

            start_datetime = datetime.strptime("%s %s" % (start_date, start_time), DATE_TIME_FORMAT)
            end_datetime = datetime.strptime("%s %s" % (end_date, end_time), DATE_TIME_FORMAT)

            if start_datetime >= end_datetime:
                abort(400, description="start datetime must not be later than end datetime")
                return

            curr_datetime = start_datetime
            while curr_datetime <= end_datetime:
                curr_weekday = curr_datetime.weekday()
                if days_of_week[curr_weekday]:
                    curr_end_datetime = curr_datetime.replace(hour=end_datetime.hour, minute=end_datetime.minute,
                                                              second=end_datetime.second)
                    tp_parsed.append((curr_datetime, curr_end_datetime))
                curr_datetime = curr_datetime + timedelta(days=1)
        except ValueError:
            abort(400, description=(
                    "Start time and end time in time_periods must follow date time format: %s" % DATE_TIME_FORMAT))
            return
        # try:
        #     start_datetime = datetime.strptime("%s %s" % (start_date, start_time), DATE_TIME_FORMAT)
        #     end_datetime = datetime.strptime("%s %s" % (end_date, end_time), DATE_TIME_FORMAT)
        #     curr_datetime = start_datetime
        #     curr_end_time = curr_datetime.replace(hour=end_datetime.hour, minute=end_datetime.minute,
        #                                           second=end_datetime.second)
        #     while curr_datetime <= end_datetime:
        #         curr_weekday = curr_datetime.weekday()
        #         if days_of_week[curr_weekday] and curr_datetime < curr_end_time:
        #             curr_end_datetime = min(curr_datetime + timedelta(hours=1), curr_end_time)
        #             tp_parsed.append((curr_datetime, curr_end_datetime))
        #             curr_datetime = curr_end_datetime
        #         else:
        #             curr_datetime.replace(hour=start_datetime.hour, minute=start_datetime.minute,
        #                                   second=start_datetime.second)
        #             curr_datetime = curr_datetime + timedelta(days=1)
        #             curr_end_time = curr_datetime.replace(hour=end_datetime.hour, minute=end_datetime.minute,
        #                                                   second=end_datetime.second)
        # except ValueError:
        #     abort(400, description=(
        #             "Start time and end time in time_periods must follow date time format: %s" % DATE_TIME_FORMAT))
        #     return

        tps_parsed.append(tp_parsed)
    return tps_parsed


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


def get_path_list_from_link_list(links):
    """
    Get a list of street names with no adjacent duplication from the list of links.
    :param links: the list of links to get street names from
    :return: a list of street names with no adjacent duplication
    """
    st_names = []
    last_st_idx = -1
    for i in range(len(links)):
        curr_name = links[i].get_st_name()

        if i == 0 or curr_name != st_names[last_st_idx]:
            st_names.append(curr_name)
            last_st_idx += 1
    return st_names
