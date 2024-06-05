"""Function for returning data from the aggregate-travel-times/ endpoint"""

from app.db import getConnection
from app.get_links import get_links
import numpy

# the way we currently do it
def mean_daily_mean(obs):
    # group the observations by date
    dates = {}
    for (dt,tt) in obs:
        dates[dt] = [tt] if not dt in dates else dates[dt] + [tt]
    # take the daily averages
    daily_means = [ numpy.mean(times) for times in dates.values() ]
    #average the days together
    return numpy.mean(daily_means)

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):
    """Function for returning data from the aggregate-travel-times/ endpoint"""

    holiday_clause = ''
    if not include_holidays:
        holiday_clause = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE cn.dt = holiday.dt
        )'''

    hourly_tt_query = f'''
        SELECT
            dt,
            SUM(cn.unadjusted_tt) * %(length_m)s::real / SUM(cn.length_w_data) AS tt
        FROM congestion.network_segments_daily AS cn
        WHERE
            cn.segment_id::integer = ANY(%(seglist)s)
            AND cn.hr <@ %(time_range)s::numrange
            AND date_part('ISODOW', cn.dt)::integer = ANY(%(dow_list)s)
            AND cn.dt <@ %(date_range)s::daterange
            {holiday_clause}
        GROUP BY
            cn.dt,
            cn.hr
        -- where corridor has at least 80pct of links with data
        HAVING SUM(cn.length_w_data) >= %(length_m)s::numeric * 0.8;
    '''

    links = get_links(start_node, end_node)

    query_params = {
        "length_m": sum(link['length_m'] for link in links),
        "seglist": list(set(link['segment_id'] for link in links)),
        "link_dir_list": [link['link_dir'] for link in links],
        "node_start": start_node,
        "node_end": end_node,
        # this is where we define that the end of the range is exclusive
        "time_range": f"[{start_time},{end_time})", # ints
        "date_range": f"[{start_date},{end_date})", # 'YYYY-MM-DD'
        "dow_list": dow_list
    }

    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            # get the hourly travel times
            cursor.execute(hourly_tt_query, query_params)
            sample = cursor.fetchall()

    connection.close()

    tt_hourly = [ tt for (dt,tt) in sample ]

    if len(sample) < 1:
        # no travel times or related info to return here
        return {
            'travel_time': None,
            'links': links,
            'query_params': query_params
        }

    tt_seconds = mean_daily_mean(sample)

    return {
        'travel_time': round(tt_seconds / 60, 2),
        'links': links,
        'query_params': query_params
    }
