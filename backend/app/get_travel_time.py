"""Function for returning data from the aggregate-travel-times/ endpoint"""

from app.db import pool
from app.links.here import get_here_links
from app.nodes.byID.here import get_here_node
from app.hereMapVersions import selectMapVersions
from app.getGitHash import getGitHash
from traveltimetools.utils import timeFormats
from haversine import haversine, Unit
from functools import reduce
import numpy
import math
import pandas
import random
import json

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
    with pool.connection() as connection:
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
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute(query, {'uri': uri, 'hash': getGitHash(), 'results': json.dumps(obj)})
            finally:
                return obj

def addLinkLengths(a,b):
    return a['length_m'] + b['length_m']

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list, subquery=False):
    """Function for returning data from the aggregate-travel-times/ endpoint"""
    # first check the cache
    cacheURI = f'/{start_node}/{end_node}/{start_time}/{end_time}/{start_date}/{end_date}/{str(include_holidays).lower()}/{"".join(map(str,dow_list))}'
    cachedValue = checkCache(cacheURI)
    if cachedValue:
        return cachedValue

    holiday_clause = ''
    if not include_holidays:
        holiday_clause = '''AND NOT EXISTS (
            SELECT 1 FROM ref.holiday WHERE ta_path.dt = holiday.dt
        )'''

    # if end_time is less than the start_time, then we wrap around midnight
    ToD_and_or = 'AND' if end_time > start_time else 'OR'

    query = f'''
        SELECT
            link_dir,
            dt::text,
            extract(HOUR FROM tod)::smallint AS hr,
            mean::real AS speed_kmph
        FROM here.ta_path
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
    '''

    hereMaps = selectMapVersions(start_date, end_date)
    thisMap = hereMaps[0] # chronologically the first map version

    links = get_here_links(start_node,end_node,thisMap['version'])
    subqueryObservations = [] # store for observations from other map versions, if any

    # if this request spans multiple map versions...
    if len(hereMaps) > 1:
        linksLength = reduce(lambda a,b:a+b,[l['length_m'] for l in links])
        for altMap in hereMaps[1:]:
            # check that routing is basically the same on the other maps
            # first, check that start, end nodes exist and are in the same spot
            for nodeId in [start_node, end_node]:
                nodeA = get_here_node(nodeId,hereMapVersion=thisMap['version'])
                nodeB = get_here_node(nodeId,hereMapVersion=altMap['version'])
                nodeDrift = haversine(
                    tuple(nodeA['geometry']['coordinates'][::-1]),
                    tuple(nodeB['geometry']['coordinates'][::-1]),
                    Unit.METERS
                )
                if nodeDrift >= 10:
                    return {'error': f'Node {nodeId} moved by ({nodeDrift}m) between map versions '+ thisMap['version'] + ' & ' + altMap['version']}
            altLinks = get_here_links(start_node,end_node,altMap['version'])
            altLength = reduce(lambda a,b:a+b,[l['length_m'] for l in altLinks])
            # length must be < +/- 2% between map versions
            lengthRatio = linksLength/altLength
            if not (lengthRatio > 0.98 and lengthRatio < 1.02):
                return {'error': 'length of corridors differs between map versions ' + thisMap['version'] + ' & ' + altMap['version']}
            # check street names for equality; assures no rerouting
            namesA = set([link['name'] for link in links])
            namesB = set([link['name'] for link in altLinks])
            if namesA != namesB:
                return {'error': 'names of streets along corridor differ between map versions ' + thisMap['version'] + ' & ' + altMap['version']}
            # if all these checks have passed, we're doing good!
            # proceed with the request, but break it up into chunks per map version
            newUpperDateLimit = min(
                end_date,
                altMap['upperDateExclusive'] if altMap['upperDateExclusive'] else '9999-01-01' # TODO: Y10K problem
            )
            subqueryObservations.append(get_travel_time(
                start_node, end_node, start_time, end_time,
                altMap['lowerDateInclusive'], # truncate date range to map version
                newUpperDateLimit,
                include_holidays, dow_list,
                subquery=True
            ))
        #pandas.concat(subqueryObservations)
        # limit the date range of this query to the current map version only
        end_date = thisMap['upperDateExclusive']

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

    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, query_params)
            link_speeds_df = pandas.DataFrame(
                cursor.fetchall(),
                columns=['link_dir','dt','hr','speed']
            ).set_index('link_dir')

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
    if subquery == True:
        # these will be incorporated directly into the main/first query
        return observations
    elif len(subqueryObservations) > 0:
        # merge observations from this and any subqueries
        observations = pandas.concat([observations] + subqueryObservations)

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
                'corridor': {
                    'links': links, 
                    'map_versions': [hm['version'] for hm in hereMaps]
                },
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
            'corridor': {
                'links': links,
                'map_versions': [hm['version'] for hm in hereMaps]
            },
            'query_params': query_params
        }
    },cacheURI)
