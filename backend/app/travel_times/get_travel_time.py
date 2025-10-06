"""Function for returning data from the aggregate-travel-times/ endpoint"""

from app.db import pool
from app.links.here import get_here_links
from app.hereMapVersions import selectMapVersions
from traveltimetools.utils import timeFormats
from app.travel_times.cache import checkCache, cacheAndReturn
from app.travel_times.bootstrap import bootstrap
from app.travel_times.daily_aggregation import mean_daily_mean
from app.corridors.conflateMapVersions import corridorsAreTheSame
from app.travel_times.dynamic_bins import createDynamicBins
import polars

def makeURI(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):
    URI = f'/{start_node}/{end_node}'
    URI += f'/{start_time}/{end_time}'
    URI += f'/{start_date}/{end_date}'
    URI += f'/{str(include_holidays).lower()}/{"".join(map(str,dow_list))}'
    return URI

def get_travel_time(start_node, end_node, start_time, end_time, start_date, end_date, include_holidays, dow_list):
    """Function for returning data from the aggregate-travel-times/ endpoint"""
    # first check the cache
    cacheURI = makeURI(
        start_node, end_node, start_time, end_time,
        start_date, end_date, include_holidays, dow_list
    )
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

    for hereMap in hereMaps:
        links, corridorURI = get_here_links(start_node, end_node, hereMap['version'])
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
                    schema=['link_dir','dt','hr','bin_num','speed']
                )

        bins = createDynamicBins(link_speeds_df[['dt','bin_num','link_dir']], links_df)

        # join link lengths and
        # calculate link travel times from speed and length (in seconds)
        link_speeds_df = link_speeds_df.join(
            links_df, on='link_dir'
        ).select( [
            'link_dir', 'dt', 'hr', 'length',
            (polars.col('length') / polars.col('speed') * 3.6).alias('link_tt')
        ] )
        # get average travel times per link / date / hour
        observations = link_speeds_df.group_by(['link_dir','dt','hr','length']).agg(
            polars.col('link_tt').mean().alias('link_avg_tt')
        ).group_by(['dt', 'hr']).agg( # sum lengths and times of available links per bin
            polars.col('link_avg_tt').sum().alias('total_tt'),
            polars.col('length').sum().alias('total_length')
        ).filter( # filter out hours with too much missing data
            polars.col('total_length') / total_corridor_length >= 0.8
        ).select( [
            'dt', 'hr',
            ( # extrapolate over missing data within each hour
                polars.col('total_tt') * total_corridor_length / polars.col('total_length')
            ).alias('tt_extrapolated')
        ] )

        try:
            # append observations from this map version
            # (try, because it's not defined yet on the first pass)
            observationsAllVersions = polars.concat(
                [observations, observationsAllVersions]
            )
        except:
            observationsAllVersions = observations

    # convert to format that can be used by the same summary function
    sample = []
    for dt, hr, tt in observationsAllVersions.iter_rows():
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
                    'links': corridorURI, 
                    'map_versions': [hm['version'] for hm in hereMaps]
                },
                'query_params': query_params
            }
        }, cacheURI)

    return cacheAndReturn({
        'results': {
            'travel_time': timeFormats(mean_daily_mean(sample),1),
            'confidence': {
                'sample': len(sample),
                'intervals': bootstrap(sample)
            },
            'observations': [timeFormats(tt,1) for (dt,tt) in sample]
        },
        'query': {
            'corridor': {
                'links': corridorURI,
                'map_versions': [hm['version'] for hm in hereMaps]
            },
            'query_params': query_params
        }
    },cacheURI)
