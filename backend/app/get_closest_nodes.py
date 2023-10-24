import json
from app.db import getConnection

def get_closest_nodes(longitude, latitude):
    """
    This function fetches a set of closest nodes to the given
    point, sorted by ascending order of distance.
    returns a GeoJSON feature for each node
    """

    with getConnection() as connection:
        with connection.cursor() as cursor:
            sql = '''
                SELECT 
                    cg_nodes.node_id::int,
                    ST_AsGeoJSON(cg_nodes.geom) AS geom,
                    cg_nodes.geom::geography <-> ST_MakePoint(%(longitude)s, %(latitude)s)::geography AS distance,
                    array_agg(DISTINCT InitCap(streets.st_name)) FILTER (WHERE streets.st_name IS NOT NULL) AS street_names
                FROM congestion.network_nodes AS cg_nodes
                JOIN here.routing_nodes_21_1 AS here_nodes USING (node_id)
                JOIN here_gis.streets_att_21_1 AS streets USING (link_id)
                GROUP BY
                    cg_nodes.node_id,
                    cg_nodes.geom
                ORDER BY distance
                LIMIT 10
                '''
            cursor.execute(sql, {"latitude": latitude, "longitude": longitude})

            candidate_nodes = []
            for node_id, geojson, distance, street_names in cursor.fetchall():
                if distance < 50: # meters
                    candidate_nodes.append( {
                        'node_id': node_id,
                        'street_names': street_names,
                        'geometry': json.loads(geojson)
                    } )
    connection.close()
    return candidate_nodes