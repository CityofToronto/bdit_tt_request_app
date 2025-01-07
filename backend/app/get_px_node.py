import json
from app.db import getConnection

SQL = '''
SELECT
    px,
    ST_AsGeoJSON(geom) AS geojson
FROM traffic.traffic_signal
WHERE "centrelineId" = %(centreline_id)s;
'''

def get_px_node(centreline_id):
    node = {}
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(SQL, {"centreline_id": centreline_id})
            if cursor.rowcount != 1:
                return None
            px, geojson = cursor.fetchone()
            node = {
                'node_id': px,
                'network': 'px',
                'geometry': json.loads(geojson)
            }
    return node