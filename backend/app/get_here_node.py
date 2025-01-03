"""fetch a specific node by it's ID"""

import json
from app.db import getConnection
from app.get_nearest_centreline_node import get_nearest_centreline_node

SQL = '''
SELECT
    ST_AsGeoJSON(
        ST_GeometryN(here_nodes.geom, 1) -- necessary because currently stored as a multi-point
    ) AS geom,
    array_agg(DISTINCT InitCap(streets.st_name)) FILTER (WHERE streets.st_name IS NOT NULL) AS street_names
FROM here.routing_nodes_23_4 AS here_nodes
JOIN here_gis.streets_att_23_4 AS streets USING (link_id)
WHERE here_nodes.node_id = %(node_id)s
GROUP BY
    here_nodes.node_id,
    here_nodes.geom;
'''

def get_here_node(node_id, conflate_with_centreline=False):
    node = {}
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(SQL, {"node_id": node_id})
            if cursor.rowcount != 1:
                return None
            geojson, street_names = cursor.fetchone()
            node = {
                'node_id': node_id,
                'street_names': street_names,
                'geometry': json.loads(geojson)
            }
            if conflate_with_centreline:
                lon = node['geometry']['coordinates'][0]
                lat = node['geometry']['coordinates'][1]
                node['conflated'] = {
                    'centreline': get_nearest_centreline_node(lon, lat)
                }
    connection.close()
    return node
