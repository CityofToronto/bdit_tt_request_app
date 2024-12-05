from app.db import getConnection
from json import loads as loadJSON

SQL = '''
WITH nearest_centreline AS (
    SELECT
        intersection_id,
        geom::geography <-> ST_MakePoint(%(longitude)s, %(latitude)s)::geography AS distance
    FROM gis_core.intersection_latest
    ORDER BY geom <-> ST_SetSRID(ST_MakePoint(%(longitude)s, %(latitude)s), 4326) ASC
    LIMIT 1
)

SELECT
    intersection_id AS centreline_id,
    ST_AsGeoJSON(geom) AS geojson,
    distance,
    ARRAY_AGG(DISTINCT linear_name_full_from) AS street_names
FROM nearest_centreline
JOIN gis_core.intersection_latest AS ci USING (intersection_id)
GROUP BY
    intersection_id,
    geom,
    distance
'''

def get_nearest_centreline_node(longitude, latitude):
    """
    Return the nearest node from the latest city centreline network

    arguments:
    longitude (float): longitude of the point to search around
    latitude (float): latitude of the point to search around
    """
    node = {}
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(SQL, {'longitude': longitude, 'latitude': latitude})
            centreline_id, geojson, distance, street_names = cursor.fetchone()
            node = {
                'centreline_id': centreline_id,
                'street_names': street_names,
                'geometry': loadJSON(geojson),
                'distance_from_supplied_coordinates': distance
            }
    connection.close()
    return node

