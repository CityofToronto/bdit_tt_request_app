"""Function for returning data from the aggregate-travel-times/ endpoint"""

from app.db import getConnection
from app.get_links import get_links
import numpy, math, pandas

# the way we currently do it
def mean_daily_mean(obs):
    # group the observations by date
    dates = {}
    for (dt,tt) in obs:
        dates[dt] = [tt] if not dt in dates else dates[dt] + [tt]
    # take the daily averages
    daily_means = [ numpy.mean(times) for times in dates.values() ]
    # average the days together
    return numpy.mean(daily_means)

def timeFormat(seconds):
    return {
        'seconds': round(seconds,3),
        'minutes': round(seconds/60,3),
        # format travel times in seconds like a clock for humans to read
        'clock': f'{math.floor(seconds/3600):02d}:{math.floor(seconds/60):02d}:{round(seconds%60):02d}'
    }

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):
    """Function for returning data from the aggregate-travel-times/ endpoint"""

    holiday_clause = ''
    if not include_holidays:
        holiday_clause = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE ta.dt = holiday.dt
        )'''

    query = f'''
        SELECT
            link_dir,
            dt,
            extract(HOUR FROM tod) AS hr,
            length,
            length / mean * 3.6 AS tt 
        FROM here.ta
        WHERE
            link_dir = ANY(%(link_dir_list)s)
            AND tod >= %(start_time)s::time
            AND tod < %(end_time)s::time
            AND date_part('ISODOW', dt) = ANY(%(dow_list)s)
            AND dt >= %(start_date)s::date
            AND dt < %(end_date)s::date
            {holiday_clause}
    '''

    links = get_links(start_node, end_node)

    total_corridor_length = sum(link['length_m'] for link in links)

    query_params = {
        # not actually query params any more, but have been useful before
        "length_m": total_corridor_length,
        "seglist": list(set(link['segment_id'] for link in links)),
        # real query params
        "link_dir_list": [link['link_dir'] for link in links],
        "node_start": start_node,
        "node_end": end_node,
        "start_time": f'{start_time:02d}:00:00',
        "end_time": f'{end_time:02d}:00:00',
        "start_date": start_date,
        "end_date": end_date,
        "dow_list": dow_list
    }

    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(query, query_params)
            raw_data_frame = pandas.DataFrame(
                cursor.fetchall(),
                columns=['link_dir','dt','hr','length','tt']
            )

    connection.close()

    # get average travel times per link / date / hour
    hr_means = raw_data_frame.groupby(['link_dir','dt','hr']).mean()
    # sum lengths and travel times of available links per date / hour
    hr_sums = hr_means.groupby(['dt','hr']).sum()
    # extrapolate over missing data within each hour
    hr_sums['tt_extrapolated'] = hr_sums['tt'] * hr_sums['length'] / total_corridor_length
    # filter out hours with too much missing data
    observations = hr_sums[ hr_sums['length'] / total_corridor_length > 0.8 ]
    # convert to format that can be used by the same summary function
    sample = []
    for tup in observations.itertuples():
        (dt, hr), tt = tup.Index, tup.tt
        sample.append((dt, tt))

    if len(sample) < 1:
        # no travel times or related info to return here
        return {
            'results': {'travel_time': None},
            'query': {
                'corridor': {'links': links},
                'query_params': query_params
            }
        }

    tt_seconds = mean_daily_mean(sample)

    return {
        'results': {'travel_time': timeFormat(tt_seconds)},
        'query': {
            'corridor': {'links': links},
            'query_params': query_params
        }
    }
