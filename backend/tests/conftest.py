import pytest

from app import app
from sqlalchemy import create_engine
import testing.postgresql


@pytest.fixture
def client():
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client


@pytest.fixture
def db():
    from app import db

    yield db


@pytest.fixture
def mock_db():
    with testing.postgresql.Postgresql(port=7654) as psql:
        engine = create_engine(psql.url())

        import pg8000
        mock_db = pg8000.connect(psql.dsn())

        yield mock_db, engine
