"""fetch a specific node by it's ID"""

import json
from app.db import getConnection

SQL = '''
SELECT
    ST_AsGeoJSON(cg_nodes.geom) AS geom,
    array_agg(DISTINCT InitCap(streets.st_name)) FILTER (WHERE streets.st_name IS NOT NULL) AS street_names
FROM congestion.network_nodes AS cg_nodes
JOIN here.routing_nodes_21_1 AS here_nodes USING (node_id)
JOIN here_gis.streets_att_21_1 AS streets USING (link_id)
WHERE node_id = %(node_id)s
GROUP BY
    node_id,
    cg_nodes.geom;
'''

def get_node(node_id):
    node = {}
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(SQL, {"node_id": node_id})
            geojson, street_names = cursor.fetchone()
            node = {
                'node_id': node_id,
                'street_names': street_names,
                'geometry': json.loads(geojson)
            }
    connection.close()
    return node
