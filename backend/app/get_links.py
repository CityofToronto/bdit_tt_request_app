import json
from app.db import getConnection
from psycopg import sql

links_query = '''
WITH results as (
    SELECT *
    FROM here_gis.{routing_function}(
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
JOIN here.{street_geoms_table} AS streets USING ( link_dir )
JOIN here_gis.{street_attributes_table} AS attr 
    ON attr.link_id::int = left(link_dir, -1)::int
ORDER BY seq;
'''

# returns a json with geometries of links between two nodes
def get_links(from_node_id, to_node_id, map_version):
    parsed_links_query = sql.SQL(links_query).format(
        routing_function = sql.Identifier(f'get_links_btwn_nodes_{map_version}'),
        street_geoms_table = sql.Identifier(f'routing_streets_{map_version}'),
        street_attributes_table = sql.Identifier(f'streets_att_{map_version}')
    )
    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                parsed_links_query,
                {
                    "node_start": from_node_id,
                    "node_end": to_node_id,
                    "map_version": map_version
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
