"""Function for returning data from the aggregate-travel-times/ endpoint"""

from app.db import getConnection
from app.get_links import get_links
import numpy
import math
import pandas
import random

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
        'clock': f'{math.floor(seconds/3600):02d}:{math.floor((seconds/60)%60):02d}:{round(seconds%60):02d}'
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
            dt::text,
            extract(HOUR FROM tod)::smallint AS hr,
            tx::text,
            mean::real AS speed_kmph
        FROM here.ta
        WHERE
            link_dir = ANY(%(link_dir_list)s)
            AND tod >= %(start_time)s::time
            AND tod < %(end_time)s::time
            AND date_part('ISODOW', dt) = ANY(%(dow_list)s)
            AND dt >= %(start_date)s::date
            AND dt < %(end_date)s::date
            {holiday_clause}
        ORDER BY tx
    '''

    links = get_links(start_node, end_node)

    links_df = pandas.DataFrame({
        'link_dir': [l['link_dir'] for l in links],
        'length': [l['length_m'] for l in links]
    }).set_index('link_dir')

    total_corridor_length = links_df['length'].sum()

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
            link_speeds_df = pandas.DataFrame(
                cursor.fetchall(),
                columns=['link_dir','dt','hr','tx','speed']
            ).set_index(['link_dir'])
    connection.close()

    # create custom binning and then remove the column used for that
    bins = make_bins(links_df, link_speeds_df)
    del link_speeds_df['tx']

    # join previously queried link lengths
    link_speeds_df = link_speeds_df.join(links_df)
    # calculate link travel times from speed and length (in seconds)
    link_speeds_df['tt'] = link_speeds_df['length'] / link_speeds_df['speed'] * 3.6
    # no longer need speeds now that this is measured in terms of travel time
    # removing it just to prevent any confusion around averaging
    link_speeds_df.drop('speed',axis='columns',inplace=True)
    # get average travel times per link / date / hour
    hr_means = link_speeds_df.groupby(['link_dir','dt','hr']).mean()
    # sum lengths and travel times of available links per date / hour
    hr_sums = hr_means.groupby(['dt','hr']).sum()
    # filter out hours with too much missing data
    observations = hr_sums[ hr_sums['length'] / total_corridor_length >= 0.8 ]
    # extrapolate over missing data within each hour
    observations = observations.assign(
        tt_extrapolated = lambda r: r.tt * total_corridor_length / r.length
    )
    # convert to format that can be used by the same summary function
    sample = []
    for tup in observations.itertuples():
        (dt, hr), tt = tup.Index, tup.tt_extrapolated
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

    reported_intervals = None
    if len(sample) > 1:
        # bootstrap for synthetic sample distribution
        sample_distribution = []
        for i in range(0,100):
            bootstrap_sample = random.choices( sample, k = len(sample) )
            sample_distribution.append( mean_daily_mean(bootstrap_sample) )
        p95lower, p95upper = numpy.percentile(sample_distribution, [2.5, 97.5])
        reported_intervals = {
            'p=0.95': {
                'lower': timeFormat(p95lower),
                'upper': timeFormat(p95upper)
            }
        }

    return {
        'results': {
            'travel_time': timeFormat(tt_seconds),
            'confidence': {
                'sample': len(sample),
                'intervals': reported_intervals
            },
            'observations': [timeFormat(tt) for (dt,tt) in sample]
        },
        'query': {
            'corridor': {'links': links},
            'query_params': query_params
        }
    }

def make_bins(links_df, link_speeds_df):
    """Create the smallest temporal bins possible while ensuring at least 80%
    of links, by length, have observations."""
    # start with an empty set of links
    links = set()
    bin_ends = list()
    total_length = links_df['length'].sum()
    minimum_length = 0.8 * total_length
    for tx in link_speeds_df.tx.unique():
        # add links one bin at a time
        five_min_bin = link_speeds_df[link_speeds_df['tx']==tx]
        links.update(five_min_bin.index.unique())
        # measure the length of links in the set
        length_so_far = links_df.loc[list(links),'length'].sum()
        # define length threshold
        if length_so_far >= minimum_length:
            bin_ends.append(tx)
            links = set() # reset
        else:
            pass
    return bin_ends