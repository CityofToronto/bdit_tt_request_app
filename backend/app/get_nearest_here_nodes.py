import json
from app.db import getConnection

SQL = '''
SELECT 
    cg_nodes.node_id::int,
    ST_AsGeoJSON(cg_nodes.geom, 5) AS geom,
    cg_nodes.geom::geography <-> ST_MakePoint(%(longitude)s, %(latitude)s)::geography AS distance,
    array_agg(DISTINCT InitCap(streets.st_name)) FILTER (WHERE streets.st_name IS NOT NULL) AS street_names
FROM congestion.network_nodes AS cg_nodes
JOIN here.routing_nodes_21_1 AS here_nodes USING (node_id)
JOIN here_gis.streets_att_21_1 AS streets USING (link_id)
GROUP BY
    cg_nodes.node_id,
    cg_nodes.geom
ORDER BY distance
LIMIT %(limit)s;
'''

def get_here_nodes_within(meters, longitude, latitude, limit=20):
    """Return intersection(s) near a provided coordinate"""
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(SQL, {"latitude": latitude, "longitude": longitude, 'limit': limit})
            candidate_nodes = []
            for node_id, geojson, distance, street_names in cursor.fetchall():
                if distance <= meters:
                    candidate_nodes.append( {
                        'node_id': node_id,
                        'network': 'here',
                        'street_names': street_names,
                        'geometry': json.loads(geojson)
                    } )
    connection.close()
    return candidate_nodes
