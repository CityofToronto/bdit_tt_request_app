from app.db import getConnection
from app.get_links import get_links

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):
    
    holiday_subquery = ''
    if not include_holidays:
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

    links = get_links(start_node, end_node)
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
    return {
        'travel_time': float(travel_time), # may be null if insufficient data
        'links': links
    }