from unittest.mock import patch

import pytest

import app.parse_util
from app.parse_util import *


@pytest.fixture()
def mock_allowed_file_types():
    yield patch.object(app.parse_util, 'ALLOWED_FILE_TYPES', ['test0', 'test1'])


@pytest.fixture()
def mock_datetime_format():
    yield patch.object(app.parse_util, 'DATE_TIME_FORMAT', "%Y-%m-%d %H:%M:%S")


@pytest.fixture()
def mock_abort():
    with patch('app.parse_util.abort') as mock_abort:
        yield mock_abort


def test_parse_file_type_request_body_empty_request(mock_allowed_file_types):
    empty_request = {}

    with mock_allowed_file_types:
        assert parse_file_type_request_body(empty_request)[0] == 'test0'


def test_parse_file_type_request_body_undefined_type(mock_allowed_file_types):
    request_without_file_type = {'test': 'test'}
    with mock_allowed_file_types:
        assert parse_file_type_request_body(request_without_file_type)[0] == 'test0'


def test_parse_file_type_request_body_invalid_type(mock_allowed_file_types):
    request_with_invalid_file_type = {'test': 'test', 'file_type': 'test-1'}
    with mock_allowed_file_types:
        assert parse_file_type_request_body(request_with_invalid_file_type)[0] == 'test0'


def test_parse_file_type_request_body_existing_types(mock_allowed_file_types):
    request_with_valid_file_type_default = {'test': 'test', 'file_type': 'test0'}
    request_with_valid_file_type_non_default = {'test': 'test', 'file_type': 'test1'}
    with mock_allowed_file_types:
        assert parse_file_type_request_body(request_with_valid_file_type_default)[0] == 'test0'
        assert parse_file_type_request_body(request_with_valid_file_type_non_default)[0] == 'test1'


def test_parse_travel_request_body_invalid_fields(mock_abort):
    request_missing_tps = {'list_of_links': []}
    request_missing_links = {'list_of_time_periods': []}
    request_inval_links = {'list_of_links': 1, 'list_of_time_periods': []}

    parse_travel_request_body(request_missing_tps)
    mock_abort.assert_called_with(400,
                                  description="Request body must contain list_of_time_periods and list_of_links.")
    mock_abort.reset_mock()
    parse_travel_request_body(request_missing_links)
    mock_abort.assert_called_with(400,
                                  description="Request body must contain list_of_time_periods and list_of_links.")
    mock_abort.reset_mock()
    parse_travel_request_body(request_inval_links)
    mock_abort.assert_called_with(400, description="both list_of_links and time_periods must be lists!")
    mock_abort.reset_mock()


@patch('app.parse_util.parse_time_periods')
def test_parse_travel_request_body(mock_parse_tp):
    mock_parse_tp.return_value = "test return"
    list_of_links = [["1", "2", "3"]]
    list_of_tps = ["1", "2"]
    request_body = {'list_of_links': list_of_links, 'list_of_time_periods': list_of_tps}

    assert parse_travel_request_body(request_body) == ("test return", [["1", "2", "3"]])
    mock_parse_tp.assert_called_once_with(["1", "2"])


def test_parse_time_periods_inval_data(mock_datetime_format, mock_abort):
    tps_not_dict = ['1', '2']
    tps_missing_field = [{'start_time': 1, 'start_date': 1, 'end_time': 1, 'end_date': 1, 'days_of_week': []}]
    tps_inval_field = [
        {'start_time': 1, 'start_date': 1, 'end_time': 1, 'end_date': 1, 'days_of_week': 1, 'include_holidays': True}]
    tps_inval_dow = [
        {'start_time': 1, 'start_date': 1, 'end_time': 1, 'end_date': 1, 'days_of_week': [True, True, True],
         'include_holidays': True}]
    tps_inval_time = [
        {'start_time': "11:11:11", 'start_date': "2012-12-12", 'end_time': "31:11:11", 'end_date': "2012-12-32",
         'days_of_week': [True, True, True, True, True, True, True], 'include_holidays': True}]
    tps_inval_time_range = [
        {'start_time': "11:11:11", 'start_date': "2012-12-12", 'end_time': "10:11:11", 'end_date': "2012-12-13",
         'days_of_week': [True, True, True, True, True, True, True], 'include_holidays': True}]
    tps_inval_date_range = [
        {'start_time': "11:11:11", 'start_date': "2012-12-12", 'end_time': "12:11:11", 'end_date': "2012-12-11",
         'days_of_week': [True, True, True, True, True, True, True], 'include_holidays': True}]

    with mock_datetime_format:
        parse_time_periods(tps_not_dict)
        mock_abort.assert_called_with(400, description="Each time period must be a dictionary (JSON)!")
        mock_abort.reset_mock()
        parse_time_periods(tps_missing_field)
        mock_abort.assert_called_with(400, description="Each time period must contain start_date, end_date, "
                                                       "start_time, end_time, days_of_week, and include_holidays.")
        mock_abort.reset_mock()
        parse_time_periods(tps_inval_field)
        mock_abort.assert_called_with(400, description="start_date, end_date, start_time, end_time should be str. "
                                                       "days_of_week should be a list. include_holidays "
                                                       "should be a bool!")
        mock_abort.reset_mock()
        parse_time_periods(tps_inval_dow)
        mock_abort.assert_called_with(400, description="days_of_week list must have length 7 (one bool val for each "
                                                       "day in the week)!")
        mock_abort.reset_mock()
        parse_time_periods(tps_inval_time)
        mock_abort.assert_called_with(400, description="Start time and end time in time_periods must follow date time "
                                                       "format: %Y-%m-%d %H:%M:%S")
        mock_abort.reset_mock()
        parse_time_periods(tps_inval_time_range)
        mock_abort.assert_called_with(400, description="start time must not be later than end time!")
        mock_abort.reset_mock()
        parse_time_periods(tps_inval_date_range)
        mock_abort.assert_called_with(400, description="start datetime must not be later than end datetime")


def test_parse_time_periods(mock_datetime_format):
    tps_inval_time = [
        {'start_time': "11:11:11", 'start_date': "2012-12-12", 'end_time': "12:11:11", 'end_date': "2012-12-13",
         'days_of_week': [True, True, True, True, True, True, True], 'include_holidays': True}]

    with mock_datetime_format:
        parsed_tps = parse_time_periods(tps_inval_time)
        assert len(parsed_tps[0]) == 2


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


def test_parse_get_links_btwn_nodes_response():
    response = '(30311192,30311212,"{29578273F,1142368555F,1142368556F}","{""type"":""MultiLineString"",""coordinates"":[[[-79.58197,43.63429],[-79.58145,43.63481]],[[-79.58273,43.63326],[-79.58263,43.63351],[-79.58244,43.63377],[-79.58218,43.63408]],[[-79.58218,43.63408],[-79.58197,43.63429]]]}")'

    result = parse_get_links_btwn_nodes_response(response)
    assert result['source'] == 30311192
    assert result['target'] == 30311212
    assert result['link_dirs'] == ['29578273F', '1142368555F', '1142368556F']
    assert result['geometry'] == {'type': 'MultiLineString',
                                  'coordinates': [[[-79.58197, 43.63429], [-79.58145, 43.63481]],
                                                  [[-79.58273, 43.63326], [-79.58263, 43.63351], [-79.58244, 43.63377],
                                                   [-79.58218, 43.63408]],
                                                  [[-79.58218, 43.63408], [-79.58197, 43.63429]]]}
