from unittest.mock import patch

import pytest

import app.parse_util
from app.parse_util import *


@pytest.fixture()
def mock_allowed_file_types():
    yield patch.object(app.parse_util, 'ALLOWED_FILE_TYPES', ['test0', 'test1'])


@pytest.fixture()
def mock_travel_query_format():
    yield patch.object(app.parse_util, 'DB_TRAVEL_DATA_QUERY_RESULT_FORMAT', {'t1': (int, 0), 't2': (float, 2)})


@pytest.fixture()
def mock_datetime_format():
    yield patch.object(app.parse_util, 'DATE_TIME_FORMAT', "%Y-%m-%d %H:%M:%S")


@pytest.fixture()
def mock_abort():
    with patch('app.parse_util.abort') as mock_abort:
        yield mock_abort


def test_parse_file_type_request_body_empty_request(mock_allowed_file_types, mock_travel_query_format):
    empty_request = {}

    with mock_allowed_file_types:
        assert parse_file_type_request_body(empty_request)[0] == 'test0'


def test_parse_file_type_request_body_undefined_type(mock_allowed_file_types, mock_travel_query_format):
    request_without_file_type = {'test': 'test'}
    with mock_allowed_file_types:
        assert parse_file_type_request_body(request_without_file_type)[0] == 'test0'


def test_parse_file_type_request_body_invalid_type(mock_allowed_file_types, mock_travel_query_format, mock_abort):
    request_with_invalid_file_type = {'test': 'test', 'file_type': 'test-1'}
    with mock_allowed_file_types:
        parse_file_type_request_body(request_with_invalid_file_type)
        mock_abort.assert_called_with(400,
                                      description="Invalid file type test-1! Allowed types: ['test0', 'test1']")


def test_parse_file_type_request_body_existing_types(mock_allowed_file_types, mock_travel_query_format):
    request_with_valid_file_type_default = {'test': 'test', 'file_type': 'test0'}
    request_with_valid_file_type_non_default = {'test': 'test', 'file_type': 'test1'}
    with mock_allowed_file_types:
        assert parse_file_type_request_body(request_with_valid_file_type_default)[0] == 'test0'
        assert parse_file_type_request_body(request_with_valid_file_type_non_default)[0] == 'test1'


# CAUTION: THE FOLLOWING TESTS ARE DEPRECATED
#
# def test_parse_travel_request_body_invalid_fields(mock_abort):
#     request_missing_tps = {'list_of_links': []}
#     request_missing_links = {'list_of_time_periods': []}
#     request_inval_links = {'list_of_links': 1, 'list_of_time_periods': []}
#
#     parse_travel_request_body(request_missing_tps)
#     mock_abort.assert_called_with(400,
#                                   description="Request body must contain list_of_time_periods and list_of_links.")
#     mock_abort.reset_mock()
#     parse_travel_request_body(request_missing_links)
#     mock_abort.assert_called_with(400,
#                                   description="Request body must contain list_of_time_periods and list_of_links.")
#     mock_abort.reset_mock()
#     parse_travel_request_body(request_inval_links)
#     mock_abort.assert_called_with(400, description="both list_of_links and time_periods must be lists!")
#     mock_abort.reset_mock()
#
#
# @patch('app.parse_util.parse_time_periods')
# def test_parse_travel_request_body(mock_parse_tp):
#     mock_parse_tp.return_value = "test return"
#     list_of_links = [["1", "2", "3"]]
#     list_of_tps = ["1", "2"]
#     request_body = {'list_of_links': list_of_links, 'list_of_time_periods': list_of_tps}
#
#     assert parse_travel_request_body(request_body) == ("test return", [["1", "2", "3"]])
#     mock_parse_tp.assert_called_once_with(["1", "2"])

#
# def test_parse_time_periods_inval_data(mock_datetime_format, mock_abort):
#     tps_not_dict = ['1', '2']
#     tps_missing_field = [{'start_time': 1, 'start_date': 1, 'end_time': 1, 'end_date': 1, 'days_of_week': []}]
#     tps_inval_field = [
#         {'start_time': 1, 'start_date': 1, 'end_time': 1, 'end_date': 1, 'days_of_week': 1, 'include_holidays': True}]
#     tps_inval_dow = [
#         {'start_time': 1, 'start_date': 1, 'end_time': 1, 'end_date': 1, 'days_of_week': [True, True, True],
#          'include_holidays': True}]
#     tps_inval_time = [
#         {'start_time': "11:11:11", 'start_date': "2012-12-12", 'end_time': "31:11:11", 'end_date': "2012-12-32",
#          'days_of_week': [True, True, True, True, True, True, True], 'include_holidays': True}]
#     tps_inval_time_range = [
#         {'start_time': "11:11:11", 'start_date': "2012-12-12", 'end_time': "10:11:11", 'end_date': "2012-12-13",
#          'days_of_week': [True, True, True, True, True, True, True], 'include_holidays': True}]
#     tps_inval_date_range = [
#         {'start_time': "11:11:11", 'start_date': "2012-12-12", 'end_time': "12:11:11", 'end_date': "2012-12-11",
#          'days_of_week': [True, True, True, True, True, True, True], 'include_holidays': True}]
#
#     with mock_datetime_format:
#         parse_time_specs(tps_not_dict)
#         mock_abort.assert_called_with(400, description="Each time period must be a dictionary (JSON)!")
#         mock_abort.reset_mock()
#         parse_time_specs(tps_missing_field)
#         mock_abort.assert_called_with(400, description="Each time period must contain start_date, end_date, "
#                                                        "start_time, end_time, days_of_week, and include_holidays.")
#         mock_abort.reset_mock()
#         parse_time_specs(tps_inval_field)
#         mock_abort.assert_called_with(400, description="start_date, end_date, start_time, end_time should be str. "
#                                                        "days_of_week should be a list. include_holidays "
#                                                        "should be a bool!")
#         mock_abort.reset_mock()
#         parse_time_specs(tps_inval_dow)
#         mock_abort.assert_called_with(400, description="days_of_week list must have length 7 (one bool val for each "
#                                                        "day in the week)!")
#         mock_abort.reset_mock()
#         parse_time_specs(tps_inval_time)
#         mock_abort.assert_called_with(400, description="Start time and end time in time_periods must follow date time "
#                                                        "format: %Y-%m-%d %H:%M:%S")
#         mock_abort.reset_mock()
#         parse_time_specs(tps_inval_time_range)
#         mock_abort.assert_called_with(400, description="start time must not be later than end time!")
#         mock_abort.reset_mock()
#         parse_time_specs(tps_inval_date_range)
#         mock_abort.assert_called_with(400, description="start datetime must not be later than end datetime")
#
#
# def test_parse_time_periods(mock_datetime_format):
#     tps_inval_time = [
#         {'start_time': "11:11:11", 'start_date': "2012-12-12", 'end_time': "12:11:11", 'end_date': "2012-12-13",
#          'days_of_week': [True, True, True, True, True, True, True], 'include_holidays': True}]
#
#     with mock_datetime_format:
#         parsed_tps = parse_time_specs(tps_inval_time)
#         assert len(parsed_tps[0]) == 2


def test_parse_link_response():
    import json
    link_dir = "1d"
    link_id = 123
    st_name = "test road"
    source = 10
    target = 20
    length = 112
    geometry = json.dumps({'type': 'test', 'coordinates': '11'})
    link_response = (link_dir, link_id, st_name, source, target, length, geometry)

    parsed_data = parse_link_response(link_response)

    assert parsed_data['link_dir'] == link_dir
    assert parsed_data['link_id'] == link_id
    assert parsed_data['st_name'] == st_name
    assert parsed_data['source'] == source
    assert parsed_data['target'] == target
    assert parsed_data['length'] == length
    assert parsed_data['geometry'] == json.loads(geometry)


def test_parse_get_links_btwn_nodes_response_no_val_link(mock_abort):
    response_inval = '()'

    parse_get_links_btwn_nodes_response(response_inval)
    mock_abort.assert_called_with(400, description="There is no valid link between the two nodes provided!")


def test_parse_get_links_btwn_nodes_response_long_path():
    response = '(30363528,881968683,"{""BLOOR ST W"",""BLOOR ST W"",""BLOOR ST W"",""BLOOR ST W"",""BLOOR ST W"",' \
               '""BLOOR ST W"",""BLOOR ST W"",""SPADINA AVE"",""SPADINA AVE"",""SPADINA AVE"",""SPADINA AVE"",' \
               '""SPADINA AVE"",""SPADINA AVE"",""SUSSEX AVE"",""SUSSEX AVE"",""SUSSEX AVE"",""SUSSEX AVE"",' \
               '""SUSSEX AVE"",""SUSSEX AVE"",""SUSSEX AVE"",""SUSSEX AVE"",""ST GEORGE ST"",""ST GEORGE ST"",' \
               '""ST GEORGE ST"",""ST GEORGE ST""}",' \
               '"{996918229F,996918230F,1104536579F,1104536580F,996918228F,798663557F,798663558F,133799945T,' \
               '783899790T,783899789T,29604208T,996923365T,996923364T,29587683F,1055849034F,1055849035F,1055849030F,' \
               '754649167F,754649168F,754591607F,754591608F,754642533T,754642532T,826565231T,826565251T}",' \
               '"{""type"":""MultiLineString"",""coordinates"":[[[-79.39827,43.66373],[-79.39771,43.66235]],' \
               '[[-79.39842,43.66409],[-79.39827,43.66373]],[[-79.40027,43.66515],[-79.39984,43.66524]],' \
               '[[-79.39863,43.66461],[-79.39852,43.66433],[-79.39842,43.66409]],[[-79.40126,43.66495],' \
               '[-79.40067,43.66507]],[[-79.40191,43.66482],[-79.40126,43.66495]],[[-79.40284,43.66462],' \
               '[-79.40262,43.66466]],[[-79.40295,43.6649],[-79.40284,43.66462]],[[-79.40262,43.66466],' \
               '[-79.40191,43.66482]],[[-79.40067,43.66507],[-79.40027,43.66515]],[[-79.4034,43.6659],' \
               '[-79.40335,43.66581]],[[-79.40429,43.66658],[-79.40385,43.66667]],[[-79.40453,43.66653],' \
               '[-79.40429,43.66658]],[[-79.4038,43.66651],[-79.40371,43.66638],[-79.40355,43.66614],' \
               '[-79.40346,43.666],[-79.4034,43.6659]],[[-79.40624,43.66617],[-79.40578,43.66627]],' \
               '[[-79.40578,43.66627],[-79.40536,43.66636]],[[-79.40536,43.66636],[-79.40527,43.66638]],' \
               '[[-79.40527,43.66638],[-79.40505,43.66642]],[[-79.40385,43.66667],[-79.40383,43.66659],' \
               '[-79.4038,43.66651]],[[-79.40505,43.66642],[-79.40453,43.66653]],[[-79.39984,43.66524],' \
               '[-79.39962,43.66529]],[[-79.39897,43.66542],[-79.39863,43.66461]],[[-79.40319,43.66549],' \
               '[-79.40311,43.66531],[-79.40295,43.6649]],[[-79.39962,43.66529],[-79.39897,43.66542]],' \
               '[[-79.40335,43.66581],[-79.40332,43.66575],[-79.40326,43.66564],[-79.40319,43.66549]]]}")'

    result = parse_get_links_btwn_nodes_response(response)
    assert result['source'] == 30363528
    assert result['target'] == 881968683
    assert result['path_name'] == "BLOOR ST W -> SPADINA AVE -> SUSSEX AVE -> ... -> ST GEORGE ST"
    assert result['link_dirs'] == ["996918229F", "996918230F", "1104536579F", "1104536580F", "996918228F", "798663557F",
                                   "798663558F", "133799945T", "783899790T", "783899789T", "29604208T", "996923365T",
                                   "996923364T", "29587683F", "1055849034F", "1055849035F", "1055849030F", "754649167F",
                                   "754649168F", "754591607F", "754591608F", "754642533T", "754642532T", "826565231T",
                                   "826565251T"]
    assert result['geometry'] == {'type': 'MultiLineString',
                                  'coordinates': [[[-79.39827, 43.66373], [-79.39771, 43.66235]],
                                                  [[-79.39842, 43.66409], [-79.39827, 43.66373]],
                                                  [[-79.40027, 43.66515], [-79.39984, 43.66524]],
                                                  [[-79.39863, 43.66461], [-79.39852, 43.66433], [-79.39842, 43.66409]],
                                                  [[-79.40126, 43.66495], [-79.40067, 43.66507]],
                                                  [[-79.40191, 43.66482], [-79.40126, 43.66495]],
                                                  [[-79.40284, 43.66462], [-79.40262, 43.66466]],
                                                  [[-79.40295, 43.6649], [-79.40284, 43.66462]],
                                                  [[-79.40262, 43.66466], [-79.40191, 43.66482]],
                                                  [[-79.40067, 43.66507], [-79.40027, 43.66515]],
                                                  [[-79.4034, 43.6659], [-79.40335, 43.66581]],
                                                  [[-79.40429, 43.66658], [-79.40385, 43.66667]],
                                                  [[-79.40453, 43.66653], [-79.40429, 43.66658]],
                                                  [[-79.4038, 43.66651], [-79.40371, 43.66638], [-79.40355, 43.66614],
                                                   [-79.40346, 43.666], [-79.4034, 43.6659]],
                                                  [[-79.40624, 43.66617], [-79.40578, 43.66627]],
                                                  [[-79.40578, 43.66627], [-79.40536, 43.66636]],
                                                  [[-79.40536, 43.66636], [-79.40527, 43.66638]],
                                                  [[-79.40527, 43.66638], [-79.40505, 43.66642]],
                                                  [[-79.40385, 43.66667], [-79.40383, 43.66659], [-79.4038, 43.66651]],
                                                  [[-79.40505, 43.66642], [-79.40453, 43.66653]],
                                                  [[-79.39984, 43.66524], [-79.39962, 43.66529]],
                                                  [[-79.39897, 43.66542], [-79.39863, 43.66461]],
                                                  [[-79.40319, 43.66549], [-79.40311, 43.66531], [-79.40295, 43.6649]],
                                                  [[-79.39962, 43.66529], [-79.39897, 43.66542]],
                                                  [[-79.40335, 43.66581], [-79.40332, 43.66575], [-79.40326, 43.66564],
                                                   [-79.40319, 43.66549]]]}


def test_parse_get_links_btwn_nodes_response_short_path():
    response = '(968341084,832219207,"{""BLOOR ST W"",""BLOOR ST W"",""BLOOR ST W"",""ST GEORGE ST"","' \
               '"ST GEORGE ST""}","{1104540963F,1104540964F,992354077F,29587498T,754592279T}",' \
               '"{""type"":""MultiLineString"",""coordinates"":[[[-79.39964,43.66704],[-79.39958,43.66692]],' \
               '[[-79.40081,43.6673],[-79.40051,43.66737]],[[-79.39983,43.66751],[-79.39964,43.66704]],' \
               '[[-79.40051,43.66737],[-79.40036,43.6674]],[[-79.40036,43.6674],[-79.39983,43.66751]]]}")'

    result = parse_get_links_btwn_nodes_response(response)
    assert result['source'] == 968341084
    assert result['target'] == 832219207
    assert result['path_name'] == "BLOOR ST W -> ST GEORGE ST"
    assert result['link_dirs'] == ["1104540963F", "1104540964F", "992354077F", "29587498T", "754592279T"]
    assert result['geometry'] == {'type': 'MultiLineString',
                                  'coordinates': [[[-79.39964, 43.66704], [-79.39958, 43.66692]],
                                                  [[-79.40081, 43.6673], [-79.40051, 43.66737]],
                                                  [[-79.39983, 43.66751], [-79.39964, 43.66704]],
                                                  [[-79.40051, 43.66737], [-79.40036, 43.6674]],
                                                  [[-79.40036, 43.6674], [-79.39983, 43.66751]]]}


def test_parse_get_links_btwn_nodes_response_same_road_path():
    response = '(30415108,832219208,' \
               '"{""HOSKIN AVE""}",' \
               '{754592281T},' \
               '"{""type"":""LineString"",""coordinates"":[[-79.39699,43.66443],[-79.39759,43.66429]]}")'

    result = parse_get_links_btwn_nodes_response(response)
    assert result['source'] == 30415108
    assert result['target'] == 832219208
    assert result['path_name'] == "HOSKIN AVE"
    assert result['link_dirs'] == ["754592281T"]
    assert result['geometry'] == {'type': 'LineString', 'coordinates': [[-79.39699, 43.66443], [-79.39759, 43.66429]]}
