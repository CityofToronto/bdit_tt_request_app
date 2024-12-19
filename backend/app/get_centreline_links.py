import json
from app.db import getConnection

links_query = '''
WITH centreline_path AS (
    SELECT unnest(links)::int AS centreline_id
    FROM gis_core.get_centreline_btwn_intersections(
        %(from_node_id)s,
        %(to_node_id)s
    )
)

SELECT
    centreline_id,
    linear_name_full_legal AS st_name,
    ST_AsGeoJSON(geom) AS geojson,
    ST_length(ST_Transform(geom, 2952)) AS length_m,
    from_intersection_id,
    to_intersection_id
FROM centreline_path
JOIN gis_core.centreline_latest USING (centreline_id)
'''

# returns a json with geometries of links between two nodes
def get_centreline_links(from_node_id, to_node_id, map_version='23_4'):
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                links_query,
                {
                    "from_node_id": from_node_id,
                    "to_node_id": to_node_id
                }
            )

            links = [
                {
                    'centreline_id': centreline_id,
                    'name': st_name,
                    #'sequence': seq,
                    'geometry': json.loads(geojson),
                    'length_m': length_m,
                    'source': source,
                    'target': target
                } for centreline_id, st_name, geojson, length_m, source, target in cursor.fetchall()
            ]

    connection.close()
    return links
