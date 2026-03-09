"""Function for returning data from the aggregate-travel-times/ endpoint"""

from app.db import pool
from app.links.here import get_here_links
from app.hereMapVersions import selectMapVersions
from traveltimetools.utils import timeFormats
from app.travel_times.cache import checkCache, cacheAndReturn
from app.travel_times.estimateParameters import estimateParameters
from app.corridors.conflateMapVersions import corridorsAreTheSame
from app.travel_times.dynamic_bins import createDynamicBins
import polars

def makeURI(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):
    URI = f'/{start_node}/{end_node}'
    URI += f'/{start_time}/{end_time}'
    URI += f'/{start_date}/{end_date}'
    URI += f'/{str(include_holidays).lower()}/{"".join(map(str,dow_list))}'
    return URI

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list, noCache=False):
    """Function for returning data from the aggregate-travel-times/ endpoint"""
    # first check the cache
    cacheURI = makeURI(
        start_node, end_node, start_time, end_time,
        start_date, end_date, include_holidays, dow_list
    )
    if not noCache:
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
            EXTRACT('EPOCH' FROM dt + tod)::int / (5 * 60) AS bin_num,
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
    # always possible that this spans a map version change
    hereMaps = selectMapVersions(start_date, end_date)
    # if this request does span multiple map versions, check that the corridor
    # is not meaningfully changed
    if len(hereMaps) > 1 and not corridorsAreTheSame(start_node, end_node, hereMaps):
        return {'error': 'corridor changed somehow between map versions'}

    observations = list()

    for hereMap in hereMaps:
        links, corridorURI = get_here_links(
            start_node,
            end_node,
            map_version = hereMap['version'],
            noCache = noCache
        )
        links_df = polars.DataFrame({
            'link_dir': [l['link_dir'] for l in links],
            'length': [l['length_m'] for l in links]
        })

        total_corridor_length = links_df['length'].sum()

        query_params = {
            "link_dir_list": [link['link_dir'] for link in links],
            "node_start": start_node,
            "node_end": end_node,
            "start_time": f'{start_time:02d}:00:00',
            "end_time": f'{end_time:02d}:00:00',
            "start_date": max(
                start_date,
                hereMap['lowerDateInclusive'] if hereMap['lowerDateInclusive'] else '2017-01-01'
            ),
            "end_date": min(
                end_date,
                # TODO: Y3K problem
                hereMap['upperDateExclusive'] if hereMap['upperDateExclusive'] else '3000-01-01'
            ),
            "dow_list": dow_list
        }
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, query_params)
                link_speeds_df = polars.DataFrame(
                    cursor.fetchall(),
                    orient='row',
                    schema={
                        'link_dir': polars.String,
                        'bin_num': polars.Int32,
                        'speed': polars.Float32
                    }
                )

        # join link lengths and
        # calculate link travel times from speed and length (in seconds)
        link_times_df = link_speeds_df.join(
            links_df, on='link_dir'
        ).select( [
            'link_dir', 'bin_num', 'length',
            (polars.col('length') / polars.col('speed') * 3.6).alias('travelTime')
        ] )

        dynamicBins = createDynamicBins(
            link_times_df.select(['link_dir','bin_num','travelTime']),
            links_df
        )

        observations += dynamicBins

    if len(observations) < 1:
        # no travel times or related info to return here
        return cacheAndReturn({
            'results': { 'estimates': None, 'observations': [] },
            'query': {
                'corridor': {
                    'links': corridorURI, 
                    'map_versions': [hm['version'] for hm in hereMaps]
                },
                'query_params': query_params
            }
        }, cacheURI)

    return cacheAndReturn({
        'results': {
            'estimates': estimateParameters(observations),
            'observations': [timeFormats(bin.travelTime, 1) for bin in observations]
        },
        'query': {
            'corridor': {
                'links': corridorURI,
                'map_versions': [hm['version'] for hm in hereMaps]
            },
            'query_params': query_params
        }
    },cacheURI)
