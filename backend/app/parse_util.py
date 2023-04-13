import json
from datetime import datetime

from flask import abort

from app import ALLOWED_FILE_TYPES, TIME_FORMAT, DATE_FORMAT, DB_TRAVEL_DATA_QUERY_RESULT_FORMAT

__all__ = ['parse_file_type_request_body', 'parse_travel_request_body', 'parse_link_response', 'parse_travel_data_query_result',
           'get_path_list_from_link_list']


def parse_file_type_request_body(file_request_data):
    """
    Parse the request body that contains a file type and wanted column names.
    The file type should be specified in the request body JSON's field file_type.
    The column names should be a list of strings.

    If the file type specified in the request body is not an valid and allowed file type, the first file type defined
    in the ALLOWED_FILE_TYPES is used by default (csv by default).

    If column names is not given, all columns will be included in the data file.

    Caution: If file type is invalid, this function will call abort with error code 400.
            If an invalid column name was given, this function will call abort with error code 400.

    :param file_request_data: the request body json
    :return: A tuple of file info. First index is the first allowed file type (csv by default) if the file type
            specified in the request body JSON is invalid or not allowed, or the specified file type otherwise.
            Second index is a list of column names to be included.
    """

    if 'file_type' in file_request_data:
        file_type = file_request_data['file_type']

        if file_type not in ALLOWED_FILE_TYPES:
            abort(400, description="Invalid file type %s! Allowed types: %s" % (file_type, ALLOWED_FILE_TYPES))
            return
    else:
        file_type = ALLOWED_FILE_TYPES[0]

    if 'columns' in file_request_data and type(file_request_data['columns']) == list:
        columns = file_request_data['columns']  # type: list

        if False in [col in DB_TRAVEL_DATA_QUERY_RESULT_FORMAT for col in columns]:
            abort(400, description="Column name invalid! Legal values are: %s" % str(
                list(DB_TRAVEL_DATA_QUERY_RESULT_FORMAT.keys())))
            return

        columns.insert(0, 'to_street')
        columns.insert(0, 'from_street')
        columns.insert(0, 'street')
        columns.insert(0, 'period')
        columns.insert(0, 'id')
    else:
        columns = list(DB_TRAVEL_DATA_QUERY_RESULT_FORMAT)

    return file_type, columns


def parse_travel_data_query_result(travel_query_result, columns, street_info):
    """
    Parse the travel data query result into python dictionaries (col_name mapped to their values).

    CAUTION: This function needs to be changed accordingly if the format of the query result has changed.

    :param travel_query_result the raw query result from database
    :param columns the column names to be included in the query result
    :param street_info the street information of each segment
    :return: a list of dictionaries containing all the travel data
    """
    travel_data_list = []

    import ast
    for result in travel_query_result:
        str_data = result[0]  # type: str

        str_data = str_data.replace('"', '').replace("'", "").replace(',', '","').replace('(', '("').replace(')', '")')

        raw_data = ast.literal_eval(str_data)
        parsed_data = {}
        st_info_index = 0

        for i in range(len(columns)):
            col_name = columns[i]
            col_spec = DB_TRAVEL_DATA_QUERY_RESULT_FORMAT[col_name]
            raw_data_type = col_spec[0]
            raw_data_i = col_spec[1]

            if raw_data_i < 0:
                parsed_data[col_name] = street_info[int(raw_data[0]) - 1][st_info_index]  # segment id
                st_info_index += 1
                continue

            curr_raw_data = raw_data[raw_data_i]

            if curr_raw_data == '' or len(curr_raw_data) == 0 or curr_raw_data.isspace():
                parsed_data[col_name] = '<no data>'
            else:
                try:
                    value = raw_data_type(curr_raw_data)
                    if raw_data_type == float:
                        value = round(value, 2)
                except ValueError:
                    abort(500, description="Database travel data query result does not match server expectations!")
                    return
                parsed_data[col_name] = value

        travel_data_list.append(parsed_data)

    return travel_data_list


def parse_travel_request_body(travel_request_data):
    """
    Parse the body of a travel data request (POST request body).

    Assumptions: The following fields should exist in request body: start_date, end_date, days_of_week,
                    include_holidays, list_of_time_periods and list_of_links
                    start_date and end_date are date strings in format %Y-%m-%d
                    start_time and end_time are time strings in format %H:%M
                    days_of_week should be a length-7 list of boolean values (0 is Monday, 6 is Sunday), representing
                    which days to include.
                    include_holidays should be a boolean value representing whether or not to include holidays
                    list_of_time_periods should be a list of time period dictionaries.
                    list_of_links should be a list containing all segments (each segment is a list of link_dirs)

    This function will call abort with response code 400 and error messages if any of the assumption is not met or if
    there is a format error.

    :param travel_request_data: The raw request body
    :return: a list containing all parameters to be passed into the database travel data aggregation function
    """
    # ensures existence of required fields
    required = ['list_of_time_periods', 'start_date', 'end_date', 'days_of_week', 'include_holidays', 'list_of_links']
    if False in [field in travel_request_data for field in required]:
        abort(400, description="Request body must contain list_of_time_periods start_date, end_date, "
                               "days_of_week, include_holidays, list_of_links.")
        return

    try:
        list_of_time_periods = list(travel_request_data['list_of_time_periods'])
        list_of_link_dirs = list(travel_request_data['list_of_links'])
        start_date = str(travel_request_data['start_date'])
        end_date = str(travel_request_data['end_date'])
        days_of_week = list(travel_request_data['days_of_week'])
        include_holidays = bool(travel_request_data['include_holidays'])
    except TypeError:
        abort(400, description="days_of_week, list_of_time_periods and list_of_link_dirs are lists! "
                               "start_date and end_date are strings! include_holidays is a boolean!")
        return

    time_period_query_param = _parse_trav_query_time_param(list_of_time_periods)
    segments_query_param = _parse_trav_query_segment_param(list_of_link_dirs)

    try:
        start_d = datetime.strptime(start_date, DATE_FORMAT)
        end_d = datetime.strptime(end_date, DATE_FORMAT)

        if start_d >= end_d:
            abort(400, description="start date must be earlier than end date")
            return
    except ValueError:
        abort(400, description=(
                "Start date and end date must follow date time format: %s" % DATE_FORMAT))
        return

    dow_query_param = _parse_trav_query_dow_param(days_of_week)

    return [time_period_query_param, segments_query_param, start_date, end_date, dow_query_param, include_holidays]


def _parse_trav_query_dow_param(dow_data: list):
    if len(dow_data) != 7:
        abort(400, description="days of week must be a list of length 7!")
        return

    dow_converted = [str(i) for i in range(1, 8) if dow_data[i - 1]]
    dow_str = '{%s}' % ",".join(dow_converted)
    return dow_str


def _parse_trav_query_segment_param(segments: list):
    segments_query_strs = []

    for i in range(len(segments)):
        try:
            segment_lst = list(segments[i])
        except TypeError:
            abort(400, description="Segment should be a list of link_dirs!")
            return

        link_dirs_str = '\\"' + str(segment_lst).replace(' ', '').replace("'", "") \
            .replace('[', '{').replace(']', '}') + '\\"'
        seg_str = '"(%d,%s)"' % (i + 1, link_dirs_str)
        segments_query_strs.append(seg_str)

    return '{%s}' % ",".join(segments_query_strs)


def _parse_trav_query_time_param(time_periods: list):
    time_periods_query_strs = []

    for tp_data in time_periods:
        try:
            tp_dict = dict(tp_data)
        except TypeError:
            abort(400, description="Time period data should be a dictionary!")
            return

        if 'name' not in tp_dict or 'start_time' not in tp_dict or 'end_time' not in tp_dict:
            abort(400, description="Each time period must have fields name, start_time and end_time!")
            return

        period_name = str(tp_dict['name'])
        start_time = str(tp_dict['start_time'])
        end_time = str(tp_dict['end_time'])

        try:
            start_t = datetime.strptime(start_time, TIME_FORMAT)
            end_t = datetime.strptime(end_time, TIME_FORMAT)

            if start_t >= end_t:
                abort(400, description="start datetime must be earlier than end datetime")
                return
        except ValueError:
            abort(400, description=(
                    "Start time and end time in time_periods must follow date time format: %s" % TIME_FORMAT))
            return

        tp_str = '"(\\"%s\\",\\"[%s:00,%s:00)\\")"' % (period_name, start_time, end_time)
        time_periods_query_strs.append(tp_str)

    return '{%s}' % ",".join(time_periods_query_strs)


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
