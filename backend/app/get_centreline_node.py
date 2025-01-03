"""fetch a specific node by it's ID"""

import json
from app.db import getConnection
from app.get_nearest_centreline_node import get_nearest_centreline_node

SQL = '''
SELECT
    ST_AsGeoJSON(geom) AS geojson,
    ARRAY_AGG(DISTINCT linear_name_full_from) AS street_names
FROM gis_core.intersection_latest
WHERE intersection_id = %(node_id)s
GROUP BY geom;

'''

def get_centreline_node(node_id, conflate_with_here=False):
    node = {}
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(SQL, {"node_id": node_id})
            if cursor.rowcount != 1:
                return None
            geojson, street_names = cursor.fetchone()
            node = {
                'node_id': node_id,
                'network': 'centreline',
                'street_names': street_names,
                'geometry': json.loads(geojson)
            }
            if conflate_with_here:
                lon = node['geometry']['coordinates'][0]
                lat = node['geometry']['coordinates'][1]
                node['conflated'] = {
                    # TODO should be Here
                    'centreline': get_nearest_centreline_node(lon, lat)
                }
    connection.close()
    return node
