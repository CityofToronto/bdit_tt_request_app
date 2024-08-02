import json
from app.db import getConnection

links_query = '''
WITH results as (
    SELECT *
    FROM here_gis.get_links_btwn_nodes_22_2(
        %(node_start)s,
        %(node_end)s
    ),
    UNNEST (links) WITH ORDINALITY AS unnested (link_dir, seq)
)

SELECT 
    results.link_dir,
    InitCap(attr.st_name) AS st_name,
    results.seq,
    ST_AsGeoJSON(streets.geom) AS geojson,
    ST_Length( ST_Transform(streets.geom,2952) ) AS length_m,
    streets.source,
    streets.target
FROM results
JOIN here.routing_streets_22_2 AS streets USING ( link_dir )
JOIN here_gis.streets_att_22_2 AS attr 
    ON attr.link_id::int = left(link_dir, -1)::int
ORDER BY seq;
'''

# returns a json with geometries of links between two nodes
def get_links(from_node_id, to_node_id):
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                links_query,
                {
                    "node_start": from_node_id,
                    "node_end": to_node_id
                }
            )

            links = [
                {
                    'link_dir': link_dir,
                    'name': st_name,
                    'sequence': seq,
                    'geometry': json.loads(geojson),
                    'length_m': length_m,
                    'source': source,
                    'target': target
                } for link_dir, st_name, seq, geojson, length_m, source, target in cursor.fetchall()
            ]

    connection.close()
    return links
