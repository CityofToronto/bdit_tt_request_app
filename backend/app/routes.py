import json, re
from datetime import datetime
from flask import jsonify, request
from app import app
from app.db import pool
from app.nodes.nearby.here import get_here_nodes_within
from app.nodes.byID.here import get_here_node
from app.nodes.byID.centreline import get_centreline_node
from app.travel_times.get_travel_time import get_travel_time
from app.links.here import get_here_links
from app.links.centreline import get_centreline_links
from app.getGitHash import getGitHash
from app.dates import currentDateBounds

# test URL: /
@app.route('/')
def index():
    """Provide basic documentation about the available resources.
    
    All endpoints return JSON-formatted data.
    """
    return jsonify({
        'description': 'Travel Time App backend',
        'available_endpoints': [
            {
                'path': str(rule),
                'docstring': app.view_functions[rule.endpoint].__doc__
            } for rule in app.url_map.iter_rules()
        ]
    })

# test URL: /version
@app.route('/version')
def version():
    """Return the Git hash of the current application HEAD"""
    return jsonify({
        'git-HEAD': getGitHash()
    })

# test URL /nodes-within/50/-79.3400/43.6610
@app.route('/nodes-within/<meters>/<longitude>/<latitude>', methods=['GET'])
def closest_node(meters, longitude, latitude):
    """Return up to 20 nodes within a given radius (in meters) of a point.

    Nodes are drawn from the Congestion Network, i.e. are fairly major intersections.

    Arguments:
    meters (float): distance around latitude and longitude to search
    latitude (float): latitude of point to search around
    longitude (float): longitude of point to search around
    """
    try:
        longitude = float(longitude)
        latitude = float(latitude)
        meters = float(meters)
    except:
        return jsonify({'error': "all inputs must be decimal numbers"})
    return jsonify(get_here_nodes_within(meters,longitude,latitude))

# test URL /node/here/30357505
#          /node/centreline/13460901
@app.route('/node/here/<node_id>', endpoint='here-nodes')
@app.route('/node/centreline/<node_id>', endpoint='centreline-nodes')
def get_node(node_id):
    """Returns information about a given node in the either the Here or
    Centreline street networks.

    This uses the latest version of either network and may not recognize an
    older node_id.
    
    arguments:
    node_id (int): identifier of the node in the latest Here map version
    optional GET arg ?doConflation will also return the nearest node in the other
        networks as well as their distance in meters from the main selected node
    """
    try:
        node_id = int(node_id)
    except:
        return jsonify({'error': "node_id should be an integer"})
    doConflation = False
    if request.args.get('doConflation') is not None:
        doConflation = True
    if request.endpoint == 'centreline-nodes':
        node = get_centreline_node(node_id, doConflation)
    else: # here network
        node = get_here_node(node_id, doConflation)
    return jsonify(node if node else {'error': 'node not found'})

# test URL /link-nodes/here/30421154/30421153
#          /link-nodes/centreline/13460901/13461051
@app.route('/link-nodes/here/<from_node_id>/<to_node_id>', endpoint='here-links')
@app.route('/link-nodes/centreline/<from_node_id>/<to_node_id>', endpoint='centreline-links')
def get_here_links_between_two_nodes(from_node_id, to_node_id):
    """Returns a list of links/edges defining the shortest path between two nodes.

    Each link has 
        * an ID (centreline_id or linkdir, depending on the reference network)
        * a geometry, GeoJSON style
        * a length in meters
        * the name of the street
        * source and target nodes in the reference network

    arguments:
    from_node_id (int): origin node ID on the reference network
    to_node_id (int): destination node ID on the reference network
    optional GET param map_version applies only to Here network
    """
    try:
        from_node_id = int(from_node_id)
        to_node_id = int(to_node_id)
    except:
        return jsonify({'error': "The node_ids should be integers"}), 400

    if from_node_id == to_node_id:
        return jsonify({'error': "Source node can not be the same as target node."}), 400

    if request.endpoint == 'here-links':
        map_version = request.args.get('map_version')
        if map_version and re.fullmatch(r'^\d{2}_\d$', map_version):
            # TODO: can pass map versions that match the pattern but don't exist
            # which will expose database errors
            links, URI = get_here_links(from_node_id,to_node_id,map_version)
        else:
            links, URI = get_here_links(from_node_id,to_node_id)
    elif request.endpoint == 'centreline-links':
        links = get_centreline_links(from_node_id, to_node_id)

    return jsonify({
        "source": from_node_id, 
        "target": to_node_id,
        "links": links
    })


# test URL /aggregate-travel-times/30310940/30310942/9/12/2020-05-01/2020-06-01/true/2
@app.route('/aggregate-travel-times/<start_node>/<end_node>/<start_time>/<end_time>/<start_date>/<end_date>/<include_holidays>/<dow_str>')
def aggregate_travel_times(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_str):
    """
    Return averaged travel times given the specified parameters.

    This function just parses arguments and otherwise wraps around `get_travel_times` which does the actual work...
    Aggregates travel times, returning averaged travel times along the selected corridor during the specified dates and times.
    Also returns some helpful diagnostic data such as the parsed query args, the route identified between the nodes, and some measures of sampling error.

    Arguments:
    start_node, end_node (int): HERE network node_id's from the current Here map version
    start_time, end_time (int): starting (inclusive), ending (exclusive) hours. May include leading zeros. If the end_time is less than the start_time, the time will wrap midnight.
    start_date, end_date (str, YYYY-MM-DD): start (inclusive), end (exclusive) dates. end_date must be greater than start_date.
    include_holidays (str, boolean): 'true' will include holidays, 'false' will exclude them if applicable
    dow_list (str): concatenated list of integers representing days of week to be included; ISODOW specification. E.g. [6,7] -> '67' for Saturday and Sunday only.
    """
    try:
        start_node = int(start_node)
        end_node = int(end_node)
    except ValueError or ArithmeticError:
        return jsonify({'error': "The node_ids should be integers"}), 400

    try:
        start_time = int(start_time)
        end_time = int(end_time)
    except:
        return jsonify({'error': "time is not in a valid format, i.e.(H or HH)"}), 400

    try:
        # attempts to parse dates to validate, but leaves them as strings
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except:
        return jsonify({'error': "dates are not in a valid format, i.e.(YYYY-MM-DD)"}), 400

    include_holidays = include_holidays.lower() in ['true', 'yes', 't']

    dow_list = list(set([int(numstr) for numstr in re.findall(r"[1-7]", dow_str)]))
    if len(dow_list) == 0:
        return jsonify({'error': "dow list does not contain valid characters, i.e. [1-7]"})

    return jsonify(
        get_travel_time(
            start_node, end_node,
            start_time, end_time,
            start_date, end_date,
            include_holidays,
            dow_list
        )
    )

# test URL /date-range
@app.route('/date-range')
def get_date_bounds():
    """Returns the dates of the earliest and latest available travel time data."""
    return currentDateBounds()

# test URL /holidays
@app.route('/holidays', methods=['GET'])
def get_holidays():
    """Return dates of all Ontario holidays in ascending order.

    Holidays will fully cover the range of any available travel time data.
    """
    query = f"""
    SELECT
        dt::text,
        EXTRACT(ISODOW FROM dt)::int,
        holiday
    FROM ref.holiday
    WHERE dt >= %(minDate)s AND dt < %(maxDate)s
    ORDER BY dt;
    """
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, get_date_bounds())
            dates = [
                {
                    'date': dt,
                    'dow': dow,
                    'name': nm
                } for (dt, dow, nm) in cursor.fetchall()
            ]
    return dates
