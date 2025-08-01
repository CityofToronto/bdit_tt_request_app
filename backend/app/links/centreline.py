import json
from app.db import pool

# returns a set of not-necessarily-ordered undirected links
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
    ST_length(ST_Transform(geom, 2952))::real AS length_m,
    from_intersection_id,
    to_intersection_id
FROM centreline_path
JOIN gis_core.centreline_latest USING (centreline_id)
'''

# pop from a list by a match function
def findPop(aList, matchFunc):
    item = next(filter(matchFunc, aList))
    index = aList.index(item)
    return aList.pop(index)

# returns a list with ordered, directed geometries of links between two nodes
def get_centreline_links(from_node_id, to_node_id):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                links_query,
                {
                    "from_node_id": from_node_id,
                    "to_node_id": to_node_id
                }
            )
            # get the unordered data in memory
            links = [
                {
                    'centreline_id': centreline_id,
                    'name': st_name,
                    'geometry': json.loads(geojson),
                    'length_m': length_m,
                    'nodes': [source, target]
                } for centreline_id, st_name, geojson, length_m, source, target in cursor.fetchall()
            ]
    # sort by hopping down the route sequentially from node to node
    sorted_links = []
    activeNode = from_node_id
    while len(links) > 0:
        link = findPop(links, lambda link: activeNode in link['nodes'] )
        if link['nodes'][0] != activeNode:
            link['nodes'].reverse()
            link['geometry']['coordinates'].reverse()
        link['source'] = link['nodes'][0]
        activeNode = link['target'] = link['nodes'][1]
        del link['nodes']
        sorted_links.append(link)
    return sorted_links
