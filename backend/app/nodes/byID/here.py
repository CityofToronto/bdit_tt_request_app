"""fetch a specific node by it's ID"""

import json
from psycopg import sql
from app.db import getConnection
from app.nodes.conflation import add_conflated_nodes
from app.selectMapVersion import selectMapVersion

node_query = '''
SELECT
    ST_AsGeoJSON(
        -- ST_GeometryN because it's stored as a multi-point
        -- https://github.com/CityofToronto/bdit_congestion/issues/79
        ST_GeometryN(here_nodes.geom, 1) 
    ) AS geom,
    array_agg(DISTINCT InitCap(streets.st_name)) FILTER (WHERE streets.st_name IS NOT NULL) AS street_names
FROM here.{routing_nodes} AS here_nodes
JOIN here_gis.{street_attributes_table} AS streets USING (link_id)
WHERE here_nodes.node_id = %(node_id)s
GROUP BY
    here_nodes.node_id,
    here_nodes.geom;
'''

def get_here_node(node_id, conflate_with_centreline=False):
    map_version = selectMapVersion() # current/latest map version
    map_version = '23_4'
    versioned_node_query = sql.SQL(node_query).format(
        routing_nodes = sql.Identifier(f'routing_nodes_{map_version}'),
        street_attributes_table = sql.Identifier(f'streets_att_{map_version}')
    )
    node = {}
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(versioned_node_query, {"node_id": node_id})
            if cursor.rowcount != 1:
                return None
            geojson, street_names = cursor.fetchone()
            node = {
                'node_id': node_id,
                'network': 'here',
                'map_version': map_version,
                'street_names': street_names,
                'geometry': json.loads(geojson)
            }
    connection.close()
    if conflate_with_centreline:
        node = add_conflated_nodes(node)
    return node
