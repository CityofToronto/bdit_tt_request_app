"""Function for returning data from the aggregate-travel-times/ endpoint"""

from app.db import getConnection
from app.get_here_links import get_here_links
from app.selectMapVersion import selectMapVersion
from traveltimetools.utils import timeFormats
import numpy
import math
import pandas
import random
import json
from app.getGitHash import getGitHash

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

def checkCache(uri):
    query = f'''
        SELECT results
        FROM nwessel.cached_travel_times
        WHERE uri_string = %(uri)s AND commit_hash = %(hash)s
    '''
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute(query, {'uri': uri, 'hash': getGitHash()})
                for (record,) in cursor: # will skip if no records
                    return record # there could only be one
            except:
                pass

def cacheAndReturn(obj,uri):
    query = f'''
        INSERT INTO nwessel.cached_travel_times (uri_string, commit_hash, results)
        VALUES (%(uri)s, %(hash)s, %(results)s)
    '''
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute(query, {'uri': uri, 'hash': getGitHash(), 'results': json.dumps(obj)})
            finally:
                return obj

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):
    """Function for returning data from the aggregate-travel-times/ endpoint"""

    # first check the cache
    cacheURI = f'/{start_node}/{end_node}/{start_time}/{end_time}/{start_date}/{end_date}/{str(include_holidays).lower()}/{"".join(map(str,dow_list))}'
    cachedValue = checkCache(cacheURI)
    if cachedValue:
        return cachedValue

    holiday_clause = ''
    if not include_holidays:
        holiday_clause = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE ta.dt = holiday.dt
        )'''

    # if end_time is less than the start_time, then we wrap around midnight
    ToD_and_or = 'AND' if end_time > start_time else 'OR'

    query = f'''
        SELECT
            link_dir,
            dt::text,
            EXTRACT('epoch' FROM tx)::bigint AS tx,
            mean::real AS speed_kmph
        FROM here.ta
        WHERE
            link_dir = ANY(%(link_dir_list)s)
            AND (
                tod >= %(start_time)s::time
                {ToD_and_or} tod < %(end_time)s::time
            )
            AND date_part('ISODOW', dt) = ANY(%(dow_list)s)
            AND dt >= %(start_date)s::date
            AND dt < %(end_date)s::date
            {holiday_clause}
        ORDER BY tx
    '''

    map_version = selectMapVersion(start_date, end_date)

    links = get_here_links(
        start_node,
        end_node,
        map_version
    )

    links_df = pandas.DataFrame({
        'link_dir': [l['link_dir'] for l in links],
        'length': [l['length_m'] for l in links]
    }).set_index('link_dir')

    total_corridor_length = links_df['length'].sum()

    query_params = {
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
                columns=['link_dir','dt','tx','speed']
            )
    connection.close()

    # create custom binning
    bins = make_bins(links_df, link_speeds_df)

    # handle the case where there are no observations; return early. 
    if link_speeds_df.empty or len(bins) == 0:
        return {
            'results': {
                'travel_time': None,
                'observations': [],
                'confidence': {
                    'sample': 0
                },
            },
            'query': {
                'corridor': {'links': links},
                'query_params': query_params
            }
        }
    # rolling join of bins to data
    link_speeds_df = pandas.merge_asof(
        link_speeds_df,
        pandas.DataFrame({'tx': bins,'bin':bins}),
        on='tx',
        direction='forward'
    ).set_index('link_dir')
    # drop column used only for binning
    link_speeds_df.drop('tx',axis='columns',inplace=True)

    # join previously queried link lengths
    link_speeds_df = link_speeds_df.join(links_df)
    # calculate link travel times from speed and length (in seconds)
    link_speeds_df['tt'] = link_speeds_df['length'] / link_speeds_df['speed'] * 3.6
    # no longer need speeds now that this is measured in terms of travel time
    # removing it just to prevent any confusion around averaging
    link_speeds_df.drop('speed',axis='columns',inplace=True)
    # get average travel times per link / date / bin
    hr_means = link_speeds_df.groupby(['link_dir','dt','bin']).mean()
    # sum lengths and travel times of available links per date / bin
    bin_sums = hr_means.groupby(['dt','bin']).sum()
    # filter out hours with too much missing data
    # i.e. incomplete bins
    observations = bin_sums[ bin_sums['length'] / total_corridor_length >= 0.8 ]
    # extrapolate over missing data within each bin
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
        return cacheAndReturn({
            'results': {
                'travel_time': None,
                'observations': [],
                'confidence': {
                    'sample': len(sample) # 0
                },
            },
            'query': {
                'corridor': {'links': links, 'map_version': map_version},
                'query_params': query_params
            }
        }, cacheURI)

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
                'lower': timeFormats(p95lower,1),
                'upper': timeFormats(p95upper,1)
            }
        }

    return cacheAndReturn({
        'results': {
            'travel_time': timeFormats(tt_seconds,1),
            'confidence': {
                'sample': len(sample),
                'intervals': reported_intervals
            },
            'observations': [timeFormats(tt,1) for (dt,tt) in sample]
        },
        'query': {
            'corridor': {'links': links, 'map_version': map_version},
            'query_params': query_params
        }
    },cacheURI)

def make_bins(links_df, link_speeds_df):
    """Create the smallest temporal bins possible while ensuring at least 80%
    of links, by length, have observations."""
    # start with empty list of bins, defined by their ends
    # TODO: define bin starts as well
    bin_ends = list()
    minimum_length = 0.8 * links_df['length'].sum()

    links_per_5mbin = {}
    # iterate over 5-min time bins with data, in chronological order
    for tx in sorted(list(link_speeds_df.tx.unique())):
        # get the data for this 5min bin
        bin5m = link_speeds_df[link_speeds_df['tx']==tx]
        # add the distinct links from this 5-minute bin
        links_per_5mbin[tx] = bin5m.link_dir.unique()
        # in case data is very sparse, drop observations more than one hour
        # prior to the current 5min bin - this window is moving!
        keys_to_drop = []
        for tx_key in links_per_5mbin.keys():
            if tx - tx_key >= 3600: # seconds, i.e. 1 hour
                keys_to_drop.append(tx_key)
        for tx_key in keys_to_drop:
            del links_per_5mbin[tx_key]
        # get all the links in all the 5m bins so far
        links = set( link for linklist in links_per_5mbin.values() for link in linklist )
        # measure the length of links in that set
        length_so_far = links_df.loc[list(links),'length'].sum()
        # compare against length threshold; if met, end the bin
        if length_so_far >= minimum_length:
            bin_ends.append(tx)
            links_per_5mbin = {}
        else:
            pass
    return bin_ends
