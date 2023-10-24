import json, re
from datetime import datetime
from flask import jsonify
from app import app
from app.db import getConnection
from app.get_closest_nodes import get_closest_nodes

from app.get_links import get_links

@app.route('/')
def index():
    return jsonify({
        'description': 'Travel Time App backend root',
        'endpoints': [str(rule) for rule in app.url_map.iter_rules()]
    })

# test URL /closest-node/-79.3400/43.6610
@app.route('/closest-node/<longitude>/<latitude>', methods=['GET'])
def closest_node(longitude,latitude):
    try:
        longitude = float(longitude)
        latitude = float(latitude)
    except:
        return jsonify({'error': "Longitude and latitude must be decimal numbers!"})
    return jsonify(get_closest_nodes(longitude,latitude))


# test URL /link-nodes/30421154/30421153
#shell function - outputs json for use on frontend
@app.route('/link-nodes/<from_node_id>/<to_node_id>', methods=['GET'])
def get_links_between_two_nodes(from_node_id, to_node_id):
    """Returns links of the shortest path between two nodes on the HERE network"""
    try:
        from_node_id = int(from_node_id)
        to_node_id = int(to_node_id)
    except:
        return jsonify({'error': "The node_ids should be integers"}), 400

    if from_node_id == to_node_id:
        return jsonify({'error': "Source node can not be the same as target node."}), 400

    (links,human_readable_path_description) = get_links(from_node_id, to_node_id)
    print(human_readable_path_description)

    return jsonify({
        "source": from_node_id, 
        "target": to_node_id,
        "links": links,
        # the following three fields are for compatibility and should eventually be removed
        "path_name": "",
        "link_dirs": [ link['link_dir'] for link in links ],
        "geometry": {
            "type": "MultiLineString",
            "coordinates": [ link['geometry']['coordinates'] for link in links ]
        }
    })




# test URL /aggregate-travel-times/30310940/30310942/9/12/2020-05-01/2020-06-01/true/2
@app.route(
    '/aggregate-travel-times/<start_node>/<end_node>/<start_time>/<end_time>/<start_date>/<end_date>/<include_holidays>/<dow_str>',
    methods=['GET']
)
# aggregate_travel_times()
#
# Params:
# - start_node(int): the node_id of the starting node
# - end_node(int): the node_id of the end node
# - start_time(int): starting hour of aggregation
# - end_time(int): end hour of aggregation
# - start_date(datetime): start date of aggregation
# - end_date(datetime): end date of aggregation
# - include_holidays(str): Set to 'true' to include holidays in aggregation, otherwise 'false' to exclude holidays.
# - dow_list(str): flattened list of integers, i.e. [1,2,3,4] -> '1234', representing days of week to be included
#
def aggregate_travel_times(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_str):
    #node_id checker
    try:
        start_node = int(start_node)
        end_node = int(end_node)
    except ValueError or ArithmeticError:
        return jsonify({'error': "The node_ids should be integers"}), 400

    #time checker
    try:
        start_time = int(start_time)
        end_time = int(end_time)
    except:
        return jsonify({'error': "time is not in a valid format, i.e.(H or HH)"}), 400

    #date checker
    try:
        datetime.strptime(start_date,"%Y-%m-%d")
        datetime.strptime(end_date,"%Y-%m-%d")
    except:
        return jsonify({'error': "dates are not in a valid format, i.e.(YYYY-MM-DD)"}), 400

    #include_holidays checker
    if include_holidays != 'true' and include_holidays != 'false':
        return jsonify({'error': "include_holidays not in valid format, i.e. ('true', 'false')"}), 400

    #dow_list checker
    dow_list = re.findall(r"[1-7]", dow_str)
    if len(dow_list) == 0:
        #Raise error and return without executing query: dow list does not contain valid characters
        return jsonify({'error': "dow list does not contain valid characters, i.e. [1-7]"})

    holiday_subquery = ''
    if include_holidays == 'false':
        holiday_subquery = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE cn.dt = holiday.dt
        ) '''
    
    agg_tt_query = f''' 
        -- Aggregate segments to corridor on a daily, hourly basis
        WITH corridor_hourly_daily_agg AS (
            SELECT
                cn.dt,
                cn.hr,
                SUM(cn.unadjusted_tt) AS corr_hourly_daily_tt
            FROM congestion.network_segments_daily AS cn
            WHERE   
                cn.segment_id::integer IN %(seglist)s
                AND cn.hr <@ %(time_range)s::numrange
                AND date_part('isodow', cn.dt)::integer IN %(dow_list)s
                AND cn.dt <@ %(date_range)s::daterange 
            {holiday_subquery}
            GROUP BY
                cn.dt,
                cn.hr
            -- where corridor has at least 80pct of links with data
            HAVING SUM(cn.length_w_data) >= %(length_m)s::numeric * 0.8 
        ),

        -- Average the hours selected into daily period level data
        corridor_period_daily_avg_tt AS (
            SELECT
                dt,
                AVG(corr_hourly_daily_tt) AS avg_corr_period_daily_tt
            FROM corridor_hourly_daily_agg
            GROUP BY
                dt
        )

        -- Average all the days with data to get period level data for each date range
        SELECT 
            ROUND(AVG(avg_corr_period_daily_tt) / 60, 2) AS average_tt_min
        FROM corridor_period_daily_avg_tt
    '''

    dow_list = re.findall(r"[1-7]", dow_str)
    if len(dow_list) == 0:
        #Raise error and return without executing query: dow list does not contain valid characters
        return jsonify({'error': "dow list does not contain valid characters, i.e. [1-7]"})

    links, stname = get_links(start_node, end_node)
    seglist=[]
    length_m = 0
    for link in links:
        length_m += link["length_m"]
        seglist.append(link["segment_id"])

    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(
                agg_tt_query, 
                {
                    "length_m": length_m,
                    "seglist": tuple(seglist),
                    "node_start": start_node,
                    "node_end": end_node,
                    "time_range": f"[{start_time},{end_time})", # ints
                    "date_range": f"[{start_date},{end_date})", # 'YYYY-MM-DD'
                    "dow_list": tuple(dow_list)
                }
            )
            travel_time, = cursor.fetchone()

    connection.close()
    return jsonify({
        'travel_time': float(travel_time), # may be null if insufficient data
        'route_text': stname,
        'links': links
    })


# test URL /date-bounds
@app.route('/date-bounds', methods=['GET'])
def get_date_bounds():
    "Get the earliest date and latest data in the travel database."
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT MIN(dt), MAX(dt) FROM here.ta;')
            ( min_date, max_date ) = cursor.fetchone()
    connection.close()
    return {
        "start_time": min_date.strftime('%Y-%m-%d'),
        "end_time": max_date.strftime('%Y-%m-%d')
    }

# test URL /holidays
@app.route('/holidays', methods=['GET'])
def get_holidays():
    "Return dates of all known holidays in ascending order"
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    dt::text,
                    holiday
                FROM ref.holiday
                ORDER BY dt;
            """)
            dates = [ {'date': dt, 'name': nm} for (dt, nm) in cursor.fetchall()]
    connection.close()
    return dates