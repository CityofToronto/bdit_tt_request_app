from app.models import Node, Link, Travel


def test_database_connection(client, db):
    """Test if the connection is live and the application can read from remote database."""
    node_table = db.session.query(Node).first()
    link_table = db.session.query(Link).first()
    travel_table = db.session.query(Travel).first()

    assert link_table is not None
    assert node_table is not None
    assert travel_table is not None
