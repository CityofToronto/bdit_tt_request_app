import json
from psycopg import sql
from app.db import pool
from app.hereMapVersions import latestMapVersion

nodes_query = '''
SELECT 
    here_nodes.node_id::int,
    ST_AsGeoJSON(here_nodes.geom, 5) AS geom,
    here_nodes.geom::geography <-> ST_MakePoint(%(longitude)s, %(latitude)s)::geography AS distance,
    array_agg(DISTINCT InitCap(streets.st_name)) FILTER (WHERE streets.st_name IS NOT NULL) AS street_names
FROM here.{routing_nodes} AS here_nodes
JOIN here_gis.{street_attributes_table} AS streets USING (link_id)
-- pure filter-join
JOIN here_gis.traffic_streets_24_4 USING (link_id)
LEFT JOIN congestion.network_nodes AS cg_nodes USING (node_id)
GROUP BY
    here_nodes.node_id,
    here_nodes.geom
HAVING
    COUNT(*) > 2
    -- necessary to include some mid-block traffic signals
    -- often at large residential/commercial garage entrances
    OR COUNT(*) FILTER (WHERE cg_nodes.node_id IS NOT NULL) = 2
ORDER BY distance
LIMIT %(limit)s;
'''

def get_here_nodes_within(meters, longitude, latitude, limit=20):
    """
    Return intersection(s) near a provided coordinate
    
    will only give nodes on the congestion network. Uses latest map version.
    """
    map_version = latestMapVersion()
    versioned_nodes_query = sql.SQL(nodes_query).format(
        routing_nodes = sql.Identifier(f'routing_nodes_{map_version}'),
        street_attributes_table = sql.Identifier(f'streets_att_{map_version}')
    )

    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                versioned_nodes_query,
                {
                    "latitude": latitude,
                    "longitude": longitude,
                    'limit': limit
                }
            )
            candidate_nodes = []
            for node_id, geojson, distance, street_names in cursor.fetchall():
                if distance <= meters:
                    candidate_nodes.append( {
                        'node_id': node_id,
                        'network': 'here',
                        'map_version': map_version,
                        'street_names': street_names,
                        'geometry': json.loads(geojson)
                    } )
    return candidate_nodes
