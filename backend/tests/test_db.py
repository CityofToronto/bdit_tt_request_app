from app.models import Node, Link, Travel


def test_real_database_connection(client, db, mock_db):
    """Test if the connection is live and the application can read from remote database."""
    node_table = db.session.query(Node).first()
    link_table = db.session.query(Link).first()
    travel_table = db.session.query(Travel).first()

    assert link_table is not None
    assert node_table is not None
    assert travel_table is not None


def test_mock_database_connection(client, db, mock_db):
    mock = mock_db[0]
    mock_eng = mock_db[1]

    assert db.session.query(Link).first() is None
