import json
from app.db import getConnection
from app.get_nearest_here_nodes import get_here_nodes_within
from app.nodes.byID.px import get_px_node

SQL = '''
SELECT
    ST_AsGeoJSON(geom) AS geojson,
    ARRAY_AGG(DISTINCT linear_name_full_from) AS street_names
FROM gis_core.intersection_latest
WHERE intersection_id = %(node_id)s
GROUP BY geom;
'''

def get_centreline_node(node_id, doConflation=False):
    """fetch a specific centreline node by it's ID"""
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
            if doConflation:
                lon = node['geometry']['coordinates'][0]
                lat = node['geometry']['coordinates'][1]
                node['conflated'] = {}
                node['conflated']['px'] = get_px_node(node_id)
                try:
                    node['conflated']['here'] = get_here_nodes_within(50, lon, lat, 1)[0]
                except:
                    pass
    connection.close()
    return node
