import json
from app.db import pool

SQL = '''
SELECT
    tts.px,
    ST_AsGeoJSON(tts.geom) AS geojson,
    array_remove(
        ARRAY[
            InitCap(gts.main_street),
            InitCap(gts.side1_street),
            InitCap(gts.side2_street)
        ],
        NULL
    ) AS street_names
FROM traffic.traffic_signal AS tts
JOIN gis.traffic_signal AS gts ON tts.px = gts.px::int
WHERE tts."centrelineId" = %(centreline_id)s;
'''

def get_px_node(centreline_id):
    node = {}
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(SQL, {"centreline_id": centreline_id})
            if cursor.rowcount != 1:
                return None
            px, geojson, street_names = cursor.fetchone()
            node = {
                'node_id': px,
                'network': 'px',
                'street_names': street_names,
                'geometry': json.loads(geojson)
            }
    return node