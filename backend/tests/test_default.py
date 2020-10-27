
def test_default(client):
    """Default Test"""

    response = client.get('/')
    assert b'Data Filter Web Application' in response.data

