import json
from app.db import pool
from app.nodes.conflation import add_conflated_nodes

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
    with pool.connection() as connection:
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
        node = add_conflated_nodes(node)
    return node
