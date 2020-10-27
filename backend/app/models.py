from sqlalchemy.dialects.postgresql import DOUBLE_PRECISION, VARCHAR, INTEGER, BYTEA, BIGINT, DATE, NUMERIC

from app import db
from os import environ


class Link(db.Model):
    __tablename__ = environ['LINK_TABLE_NAME']

    id = db.Column(BIGINT, primary_key=True)
    wkb_geometry = db.Column(BYTEA)
    link_dir = db.Column(VARCHAR)
    link_id = db.Column(INTEGER)
    st_name = db.Column(VARCHAR)
    source = db.Column(INTEGER)
    target = db.Column(INTEGER)
    length = db.Column(DOUBLE_PRECISION)


class Node(db.Model):
    __tablename__ = environ['NODE_TABLE_NAME']

    ogc_fid = db.Column(INTEGER, primary_key=True)
    wkb_geometry = db.Column(BYTEA)
    node_id = db.Column(INTEGER)


class Travel(db.Model):
    __tablename__ = environ['TRAVEL_DATA_TABLE_NAME']

    id = db.Column(INTEGER, primary_key=True)
    link_dir = db.Column(VARCHAR)
    tx = db.Column(DATE)
    length = db.Column(INTEGER)
    mean = db.Column(NUMERIC)
    stddev = db.Column(NUMERIC)
    confidence = db.Column(INTEGER)
    pct_50 = db.Column(INTEGER)
