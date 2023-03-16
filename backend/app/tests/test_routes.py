from unittest.mock import patch

import pytest

import app.routes


@pytest.fixture
def client():
    from app import app
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client


@pytest.fixture()
def mock_datetime_format():
    yield patch.object(app.routes, 'DATE_TIME_FORMAT', "%Y-%m-%d %H:%M:%S")


def test_index(client):
    """Test index route returns correct project name string"""

    response = client.get('/')
    assert b'Data Filter Web Application' in response.data


# CAUTION: THE FOLLOWING TESTS ARE DEPRECATED
#
# def test_travel_data_time_period_block(mock_datetime_format):
#     from datetime import datetime
#     from math import sqrt
#     start_time = datetime.strptime("2020-11-11 10:10", "%Y-%m-%d %H:%M")
#     end_time = datetime.strptime("2020-11-11 14:50", "%Y-%m-%d %H:%M")
#     mock_data_1 = MagicMock(tx=datetime.strptime("2020-11-11 10:15", "%Y-%m-%d %H:%M"))
#     mock_data_1.json.return_value = {'mean': 1.5, 'stddev': 1.0, 'confidence': 10, 'pct_50': 20}
#     mock_data_2 = MagicMock(tx=datetime.strptime("2020-11-11 11:09", "%Y-%m-%d %H:%M"))
#     mock_data_2.json.return_value = {'mean': 2.5, 'stddev': 3.0, 'confidence': 30, 'pct_50': 40}
#
#     mock_data_3 = MagicMock(tx=datetime.strptime("2020-11-11 11:10", "%Y-%m-%d %H:%M"))
#     mock_data_3.json.return_value = {'mean': 100.0, 'stddev': 1.0, 'confidence': 10, 'pct_50': 20}
#
#     tp_data = app.routes._TravelDataTimePeriodBlock(start_time, end_time, 3600)
#     tp_data.register_data(mock_data_1)
#     tp_data.register_data(mock_data_2)
#     tp_data.register_data(mock_data_3)
#     mean_data = tp_data.get_mean_data_list(1, "test", "test", "test", 1.0, 1.0)
#
#     assert tp_data.get_seconds_interval() == 3600
#
#     assert len(tp_data) == len(mean_data) == 5
#     assert mean_data[0]['seg_i'] == 1
#     assert mean_data[0]['from_street'] == "test"
#     assert mean_data[0]['to_street'] == "test"
#     assert mean_data[0]['path_str'] == "test"
#     assert mean_data[0]['links_length'] == 1.0
#     assert mean_data[0]['data_length'] == 1.0
#     assert mean_data[0]['from_tx'] == "2020-11-11 10:10"
#     assert mean_data[0]['to_tx'] == "2020-11-11 11:10"
#     assert mean_data[0]['mean_spd'] == 2.0
#     assert mean_data[0]['mean_stddev'] == round(sqrt((1.0 ** 2 + 3.0 ** 2) / 2), 2)
#     assert mean_data[0]['mean_confidence'] == 20
#     assert mean_data[0]['mean_pct_50'] == 30
#
#     assert mean_data[1]['seg_i'] == 1
#     assert mean_data[1]['from_street'] == "test"
#     assert mean_data[1]['to_street'] == "test"
#     assert mean_data[1]['path_str'] == "test"
#     assert mean_data[1]['links_length'] == 1.0
#     assert mean_data[1]['data_length'] == 1.0
#     assert mean_data[1]['from_tx'] == "2020-11-11 11:10"
#     assert mean_data[1]['to_tx'] == "2020-11-11 12:10"
#     assert mean_data[1]['mean_spd'] == 100.0
#     assert mean_data[1]['mean_stddev'] == 1.0
#     assert mean_data[1]['mean_confidence'] == 10
#     assert mean_data[1]['mean_pct_50'] == 20
#
#     assert mean_data[4]['seg_i'] == 1
#     assert mean_data[4]['from_street'] == "test"
#     assert mean_data[4]['to_street'] == "test"
#     assert mean_data[4]['path_str'] == "test"
#     assert mean_data[4]['links_length'] == 1.0
#     assert mean_data[4]['data_length'] == 1.0
#     assert mean_data[4]['from_tx'] == "2020-11-11 14:10"
#     assert mean_data[4]['to_tx'] == "2020-11-11 14:50"
#     assert mean_data[4]['mean_spd'] == 0.0
#     assert mean_data[4]['mean_stddev'] == 0.0
#     assert mean_data[4]['mean_confidence'] == 0
#     assert mean_data[4]['mean_pct_50'] == 0
