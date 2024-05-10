from app.db import getConnection
from app.get_links import get_links

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):
    
    tt_holiday_clause = ''
    sample_holiday_clause = ''
    if not include_holidays:
        tt_holiday_clause = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE cn.dt = holiday.dt
        )'''
        sample_holiday_clause = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE ta_path.dt = holiday.dt
        )'''

    
    agg_tt_query = f''' 
        -- Aggregate segments to corridor on a daily, hourly basis
        WITH corridor_hourly_daily_agg AS (
            SELECT
                cn.dt,
                cn.hr,
                SUM(cn.unadjusted_tt) * %(length_m)s::numeric / SUM(cn.length_w_data) AS corr_hourly_daily_tt
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
            cursor.execute(agg_tt_query, query_params)
            # travel_time may be null if there's insufficient data
            travel_time, = cursor.fetchone()

    connection.close()
    return {
        'travel_time': None if travel_time is None else float(travel_time),
        'links': links,
        'query_params': query_params
    }