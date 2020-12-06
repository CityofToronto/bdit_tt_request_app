from os import environ

from geoalchemy2 import Geometry
from sqlalchemy.dialects.postgresql import DOUBLE_PRECISION, VARCHAR, INTEGER, BIGINT, TIMESTAMP, NUMERIC

from app import db, POSTGIS_GEOM_SRID


class Link(db.Model):
    __tablename__ = environ['LINK_TABLE_NAME']

    id = db.Column(BIGINT, primary_key=True)
    link_dir = db.Column(VARCHAR)
    link_id = db.Column(INTEGER)
    st_name = db.Column(VARCHAR)
    source = db.Column(INTEGER)
    target = db.Column(INTEGER)
    length = db.Column(DOUBLE_PRECISION)
    geom = db.Column(Geometry(geometry_type='LINESTRING', srid=POSTGIS_GEOM_SRID))

    def get_st_name(self):
        return str(self.st_name)


class Node(db.Model):
    __tablename__ = environ['NODE_TABLE_NAME']

    ogc_fid = db.Column(INTEGER, primary_key=True)
    node_id = db.Column(INTEGER)
    intersec_name = db.Column(VARCHAR)
    geom = db.Column(Geometry(geometry_type='POINT', srid=POSTGIS_GEOM_SRID))


class Travel(db.Model):
    __tablename__ = environ['TRAVEL_DATA_TABLE_NAME']

    link_dir = db.Column(VARCHAR)
    tx = db.Column(TIMESTAMP)
    length = db.Column(INTEGER)
    mean = db.Column(NUMERIC)
    stddev = db.Column(NUMERIC)
    confidence = db.Column(INTEGER)
    pct_50 = db.Column(INTEGER)
    id = db.Column(INTEGER, primary_key=True)

    def json(self):
        return {"link_dir": str(self.link_dir), "tx": str(self.tx), "length": int(self.length),
                "mean": float(self.mean), "stddev": float(self.stddev), "confidence": int(self.confidence),
                "pct_50": int(self.pct_50)}
