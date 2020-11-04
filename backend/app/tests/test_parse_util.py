from unittest import mock

import pytest

import app.parse_util
from app.parse_util import *


@pytest.fixture()
def mock_allowed_file_types():
    yield mock.patch.object(app.parse_util, 'ALLOWED_FILE_TYPES', ['test0', 'test1'])


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

