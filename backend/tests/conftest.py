import pytest

from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client


@pytest.fixture
def db():
    from app import db

    db.create_all()

    yield db
