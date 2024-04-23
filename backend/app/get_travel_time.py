from app.db import getConnection
from app.get_links import get_links
import numpy, random

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):

    tt_holiday_clause = ''
    if not include_holidays:
        tt_holiday_clause = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE cn.dt = holiday.dt
        )'''

    hourly_tt_query = f'''
        SELECT
            SUM(cn.unadjusted_tt) * %(length_m)s::real / SUM(cn.length_w_data) AS tt
        FROM congestion.network_segments_daily AS cn
        WHERE
            cn.segment_id::integer = ANY(%(seglist)s)
            AND cn.hr <@ %(time_range)s::numrange
            AND date_part('ISODOW', cn.dt)::integer = ANY(%(dow_list)s)
            AND cn.dt <@ %(date_range)s::daterange
            {tt_holiday_clause}
        GROUP BY
            cn.dt,
            cn.hr
        -- where corridor has at least 80pct of links with data
        HAVING SUM(cn.length_w_data) >= %(length_m)s::numeric * 0.8;
    '''

    links = get_links(start_node, end_node)

    query_params = {
        "length_m": sum([link['length_m'] for link in links]),
        "seglist": list(set([link['segment_id'] for link in links])),
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
            tt_hourly = [ tt for (tt,) in cursor.fetchall() ]
    connection.close()

    # bootstrap for synthetic sample distribution
    sample_distribution = []
    for i in range(0,100):
        bootstrap_sample = random.choices(
            tt_hourly,
            k = len(tt_hourly)
        )
        sample_distribution.append( numpy.mean(bootstrap_sample) )

    return {
        'average_travel_time': numpy.mean(tt_hourly),
        'confidence_intervals': {
            'upper': numpy.percentile(sample_distribution,95),
            'lower': numpy.percentile(sample_distribution,5)
        },
        'all_hourly_travel_times': tt_hourly,
        'links': links,
        'query_params': query_params
    }