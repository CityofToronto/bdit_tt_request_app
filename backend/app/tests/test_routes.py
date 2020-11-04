import pytest

from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client


def test_index(client):
    """Test index route returns correct project name string"""

    response = client.get('/')
    assert b'Data Filter Web Application' in response.data
