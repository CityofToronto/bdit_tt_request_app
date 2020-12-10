import pytest

from app.models import Node, Link


@pytest.fixture
def db():
    from app import db

    yield db


def test_real_database_connection(db):
    """Test if the connection is live and the application can read from remote database."""
    node_table = db.session.query(Node).first()
    link_table = db.session.query(Link).first()

    assert link_table is not None
    assert node_table is not None
