import json
from os import environ

from flask import abort, jsonify
from sqlalchemy import func

from app import app, db
from app.models import Link, Node

METER_UNIT_SRID = 26986


@app.route('/')
def index():
    return "Data Filter Web Application"


@app.route('/closest-node/<longitude>/<latitude>', methods=['GET'])
def get_closest_node(longitude, latitude):
    """
    Get the closest 10 nodes to the given longitude and latitude.
    This function converts geometry points to srid METER_UNIT_SRID(26986) point
    using ST_Transform and then calculate their distance in meters using ST_Distance.
    This function may not return an array of exact length 10 if there is less than 10 points
    in the database.

    :param longitude: the longitude of the origin point
    :param latitude: the latitude of the origin point
    :return: JSON of an array containing the 10 closest nodes (if there are more than 10 nodes).
            The array is sorted in ascending distance order. node object keys: node_id(int),
            geometry(geom{type(str), coordinates(list[int])})
    """
    origin_point = _get_srid_point(longitude, latitude)

    nodes_ascend_dist_order_query_result = Node.query \
        .with_entities(Node.node_id, Node.geom.ST_AsGeoJSON()) \
        .order_by(func.ST_Distance(func.ST_Transform(Node.geom, METER_UNIT_SRID),
                                   _transform_to_meter_srid(origin_point)).asc())

    ten_closest_nodes = []
    node_count = 0
    for node_data in nodes_ascend_dist_order_query_result:
        if node_count >= 10:
            break
        ten_closest_nodes.append(_parse_node_response(node_data))
        node_count += 1

    return jsonify(ten_closest_nodes)


@app.route('/link-nodes/<from_node_id>/<to_node_id>', methods=['GET'])
def get_links_between_nodes(from_node_id, to_node_id):
    """
    Get the shortest length link between the two given nodes.
    This function filters links using ST_Intersects and sort them using the
    length attribute of the link object.

    :param from_node_id: source node id
    :param to_node_id: target node id
    :return: JSON representing a link object, which is the shortest link between
            the two points. Link object keys: link_dir(str), link_id(int), st_name(str),
            source(int), target(int), length(float),
            geometry(geom{type(str), coordinates(list[int])})
    """
    from_point = _get_node_by_id(from_node_id)
    to_point = _get_node_by_id(to_node_id)

    shortest_link_query_result = Link.query \
        .with_entities(Link.link_dir, Link.link_id, Link.st_name, Link.source, Link.target, Link.length,
                       Link.geom.ST_AsGeoJSON()) \
        .filter(Link.geom.ST_Intersects(from_point.geom), Link.geom.ST_Intersects(to_point.geom)) \
        .order_by(Link.length.asc()) \
        .first()

    shortest_link = _parse_link_response(shortest_link_query_result)
    return jsonify(shortest_link)


@app.route('/travel-data', methods=['POST'])
def get_links_travel_data():
    raise NotImplementedError


@app.route('/date-bounds', methods=['GET'])
def get_date_bounds():
    raise NotImplementedError


def _parse_link_response(link_data):
    """
    Parse the given Link query result to a dictionary that can be jsonify-ed.
    The received the link_data should have all columns in Link model in a tuple.
    The link_data should contain the following fields (in order):
        link_dir(str), link_id(int), st_name(str), source(int), target(int),
        length(float), geometry(geom{type(str), coordinates(list[int])})

    :param link_data: the query result from the Link table in the database
    :return: a dictionary containing the attributes (except id)
            for the Link query that can be jsonify-ed.
    """
    return {"link_dir": link_data[0], "link_id": link_data[1], "st_name": link_data[2],
            "source": link_data[3], "target": link_data[4], "length": link_data[5],
            "geometry": json.loads(link_data[6])}


def _parse_node_response(node_data):
    """
    Parse the given Node query result to a dictionary that can be jsonify-ed.
    The received the node_data should have all columns in Node model in a tuple.
    The link_data should contain the following fields (in order):
        node_id(int), geometry(geom{type(str), coordinates(list[int])})

    :param node_data: the query result from the Node table in the database
    :return: a dictionary containing the attributes for the Node query that can be jsonify-ed.
    """
    return {"node_id": node_data[0], "geometry": json.loads(node_data[1])}


def _get_srid_point(longitude, latitude):
    """
    Make a point at the given longitude and latitude with the SRID provided in the environment.
    Uses ST_SetSrid and ST_MakePoint.

    Assumption: There is a POSTGIS_GEOM_SRID field in the system environment (os.environ).

    :param longitude: the longitude of the point
    :param latitude: the latitude of the point
    :return: a point at the given longitude and latitude with srid in the environment
    """
    return func.ST_SetSrid(func.ST_MakePoint(longitude, latitude), int(environ['POSTGIS_GEOM_SRID']))


def _transform_to_meter_srid(original_point):
    """
    Transforms the original point to a new point using the METER_UNIT_SRID.

    :param original_point: the point to be transformed
    :return: original point with srid transformed to METER_UNIT_SRID
    """
    return func.ST_Transform(original_point, METER_UNIT_SRID)


def _get_node_by_id(node_id: str):
    """
    Get the node query result given its node_id.
    This function will call abort with response code 400 if the given node_id
    can not be cast to an integer.

    :param node_id: the node_id of the target node
    :return: the node that corresponds to the node_id
    """
    try:
        node_id_int = int(node_id)
    except ValueError:
        abort(400, description="Node id must be an integer!")
        return

    node_query_result = Node.query \
        .filter(Node.node_id == node_id_int) \
        .first()
    return node_query_result
