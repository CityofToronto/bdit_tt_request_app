import json
from app.db import getConnection

sql = '''
SELECT 
    cg_nodes.node_id::int,
    ST_AsGeoJSON(cg_nodes.geom) AS geom,
    array_agg(DISTINCT InitCap(streets.st_name)) FILTER (WHERE streets.st_name IS NOT NULL) AS street_names
FROM congestion.network_nodes AS cg_nodes
JOIN here.routing_nodes_21_1 AS here_nodes USING (node_id)
JOIN here_gis.streets_att_21_1 AS streets USING (link_id)
WHERE node_id = %(node_id)s
GROUP BY
    cg_nodes.node_id,
    cg_nodes.geom;
'''

# TODO code could use some tidying up
def get_node(node_id):
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql, {"node_id": node_id})
            nodes = []
            for node_id, geojson, street_names in cursor.fetchall():
                nodes.append( {
                    'node_id': node_id,
                    'street_names': street_names,
                    'geometry': json.loads(geojson)
                } )
    connection.close()
    return nodes[0] if len(nodes) > 0 else {}