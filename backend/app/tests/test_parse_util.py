from unittest.mock import patch, ANY

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
        assert parse_file_type_request_body(empty_request) == 'test0'


def test_parse_file_type_request_body_undefined_type(mock_allowed_file_types):
    request_without_file_type = {'test': 'test'}
    with mock_allowed_file_types:
        assert parse_file_type_request_body(request_without_file_type) == 'test0'


def test_parse_file_type_request_body_invalid_type(mock_allowed_file_types):
    request_with_invalid_file_type = {'test': 'test', 'file_type': 'test-1'}
    with mock_allowed_file_types:
        assert parse_file_type_request_body(request_with_invalid_file_type) == 'test0'


def test_parse_file_type_request_body_existing_types(mock_allowed_file_types):
    request_with_valid_file_type_default = {'test': 'test', 'file_type': 'test0'}
    request_with_valid_file_type_non_default = {'test': 'test', 'file_type': 'test1'}
    with mock_allowed_file_types:
        assert parse_file_type_request_body(request_with_valid_file_type_default) == 'test0'
        assert parse_file_type_request_body(request_with_valid_file_type_non_default) == 'test1'

# TODO: fix the test cases to match new logic
# def test_parse_travel_request_body_missing_req_fields(mock_datetime_format, mock_abort):
#     request_missing_start_time = {'end_time': '2018-09-01 17:05:00', 'link_dirs': ['1', '2']}
#     request_missing_end_time = {'start_time': '2018-09-01 17:00:00', 'link_dirs': ['1', '2']}
#     request_missing_link_dir = {'start_time': '2018-09-01 17:00:00', 'end_time': '2018-09-01 17:05:00'}
#
#     with mock_datetime_format:
#         parse_travel_request_body(request_missing_start_time)
#         mock_abort.assert_called_with(400, description=ANY)
#         mock_abort.reset_mock()
#         parse_travel_request_body(request_missing_end_time)
#         mock_abort.assert_called_with(400, description=ANY)
#         mock_abort.reset_mock()
#         parse_travel_request_body(request_missing_link_dir)
#         mock_abort.assert_called_with(400, description=ANY)
#
#
# def test_parse_travel_request_body_invalid_time_format(mock_datetime_format, mock_abort):
#     request_wrong_start_time_format = {'start_time': '2009-06-15T13:45:30', 'end_time': '2018-09-01 17:00:00',
#                                        'link_dirs': []}
#     request_wrong_end_time_format = {'start_time': '2020-01-13 10:00:00', 'end_time': '2009-06-15T13:45:30',
#                                      'link_dirs': []}
#     request_invalid_start_time_1 = {'start_time': '2020-19-13 10:00:00', 'end_time': '2018-09-01 17:00:00',
#                                     'link_dirs': []}
#     request_invalid_end_time_1 = {'start_time': '2020-01-13 10:00:00', 'end_time': '2018-19-01 17:00:00',
#                                   'link_dirs': []}
#     request_invalid_start_time_2 = {'start_time': '2020-09-13 30:00:00', 'end_time': '2018-09-01 17:00:00',
#                                     'link_dirs': []}
#     request_invalid_end_time_2 = {'start_time': '2020-01-13 10:00:00', 'end_time': '2018-09-01 30:00:00',
#                                   'link_dirs': []}
#
#     with mock_datetime_format:
#         parse_travel_request_body(request_wrong_start_time_format)
#         mock_abort.assert_called_with(400, description=ANY)
#         mock_abort.reset_mock()
#         parse_travel_request_body(request_wrong_end_time_format)
#         mock_abort.assert_called_with(400, description=ANY)
#         mock_abort.reset_mock()
#         parse_travel_request_body(request_invalid_start_time_1)
#         mock_abort.assert_called_with(400, description=ANY)
#         mock_abort.reset_mock()
#         parse_travel_request_body(request_invalid_start_time_2)
#         mock_abort.assert_called_with(400, description=ANY)
#         mock_abort.reset_mock()
#         parse_travel_request_body(request_invalid_end_time_1)
#         mock_abort.assert_called_with(400, description=ANY)
#         mock_abort.reset_mock()
#         parse_travel_request_body(request_invalid_end_time_2)
#         mock_abort.assert_called_with(400, description=ANY)
#
#
# def test_parse_travel_request_body_invalid_link_dir(mock_datetime_format, mock_abort):
#     request_invalid_link_dir_1 = {'start_time': '2020-1-13 10:00:00', 'end_time': '2018-09-01 17:00:00',
#                                   'link_dirs': "123"}
#     request_invalid_link_dir_2 = {'start_time': '2020-1-13 10:00:00', 'end_time': '2018-09-01 17:00:00',
#                                   'link_dirs': 1}
#
#     with mock_datetime_format:
#         parse_travel_request_body(request_invalid_link_dir_1)
#         mock_abort.assert_called_with(400, description=ANY)
#         mock_abort.reset_mock()
#         parse_travel_request_body(request_invalid_link_dir_2)
#         mock_abort.assert_called_with(400, description=ANY)

#
# def test_parse_travel_request_body(mock_datetime_format):
#     start_time = '2020-1-13 10:00:00'
#     end_time = '2018-09-01 17:00:00'
#     link_dirs = [1, 2, 3]
#     request_body = {'start_time': start_time, 'end_time': end_time, 'link_dirs': link_dirs}
#
#     with mock_datetime_format:
#         assert parse_travel_request_body(request_body) == (start_time, end_time, link_dirs)


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
