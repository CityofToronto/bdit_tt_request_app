import json
from app.db import getConnection
from psycopg import sql
from app.selectMapVersion import selectMapVersion
from app.getGitHash import getGitHash

cacheQuery = '''
SELECT results
FROM nwessel.cached_tt_routes
WHERE
    node_start = %(node_start)s
    AND node_end = %(node_end)s
    AND map_version = %(map_version)s
    AND commit_hash = %(hash)s;
'''

cacheInsert = '''
INSERT INTO nwessel.cached_tt_routes (node_start, node_end, map_version, commit_hash, results)
VALUES (%(node_start)s,%(node_end)s,%(map_version)s, %(hash)s, %(results)s)
'''

def cacheAndReturn(obj,node_start,node_end,map_version):
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute(
                    cacheInsert,
                    {
                        'node_start': node_start,
                        'node_end': node_end,
                        'map_version': map_version,
                        'hash': getGitHash(),
                        'results': json.dumps(obj)
                    }
                )
            finally:
                return obj

def checkCache(node_start, node_end, map_version):
    connection = getConnection()
    with connection:
        with connection.cursor() as cursor:
            try: # try keeps this loosely coupled - no strict dependency
                cursor.execute(
                    cacheQuery,
                    {
                        'node_start': node_start,
                        'node_end': node_end,
                        'map_version': map_version,
                        'hash': getGitHash()
                    }
                )
                for (record,) in cursor: # will skip if no records
                    return record # there could only be one because of constraint
            except:
                pass

links_query = '''
WITH results as (
    SELECT *
    FROM here_gis.{routing_function}(
        %(node_start)s,
        %(node_end)s
    ),
    UNNEST (links) WITH ORDINALITY AS unnested (link_dir, seq)
)

SELECT 
    results.link_dir,
    InitCap(attr.st_name) AS st_name,
    results.seq,
    ST_AsGeoJSON(ST_LineMerge(streets.geom)) AS geojson,
    ST_Length( ST_Transform(streets.geom,2952) ) AS length_m,
    streets.source::bigint, -- numeric in 24_4; python does not like
    streets.target::bigint -- ditto
FROM results
JOIN here.{street_geoms_table} AS streets USING ( link_dir )
JOIN here_gis.{street_attributes_table} AS attr 
    ON attr.link_id::int = left(link_dir, -1)::int
ORDER BY seq;
'''

# returns a json with geometries of links between two nodes
def get_here_links(from_node_id, to_node_id, map_version='??_?'):
    if map_version == '??_?':
        # defaults to whatever map version covers latest data
        map_version = selectMapVersion()
    if map_version != '??_?':
        cachedLinks = checkCache(from_node_id, to_node_id, map_version)
        if cachedLinks:
            return cachedLinks

    parsed_links_query = sql.SQL(links_query).format(
        routing_function = sql.Identifier(f'get_links_btwn_nodes_{map_version}'),
        street_geoms_table = sql.Identifier(f'routing_streets_{map_version}'),
        street_attributes_table = sql.Identifier(f'streets_att_{map_version}')
    )
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                parsed_links_query,
                {
                    "node_start": from_node_id,
                    "node_end": to_node_id,
                    "map_version": map_version
                }
            )

            links = [
                {
                    'link_dir': link_dir,
                    'name': st_name,
                    'sequence': seq,
                    'geometry': json.loads(geojson),
                    'length_m': length_m,
                    'source': source,
                    'target': target
                } for link_dir, st_name, seq, geojson, length_m, source, target in cursor.fetchall()
            ]

    connection.close()
    return cacheAndReturn(links,from_node_id,to_node_id,map_version)
