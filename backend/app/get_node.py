"""fetch a specific node by it's ID"""

import json
from app.db import getConnection

SQL = '''
SELECT
    ST_AsGeoJSON(ST_Dump(here_nodes.geom)) AS geom,
    array_agg(DISTINCT InitCap(streets.st_name)) FILTER (WHERE streets.st_name IS NOT NULL) AS street_names
FROM here.routing_nodes_23_4 AS here_nodes
JOIN here_gis.streets_att_23_4 AS streets USING (link_id)
WHERE node_id = %(node_id)s
GROUP BY
    node_id,
    here_nodes.geom;
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
