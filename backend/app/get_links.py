import json
from app.db import getConnection

# returns a json with geometries of links between two nodes
def get_links(from_node_id, to_node_id):
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
            seg_lookup.segment_id,
            ST_AsGeoJSON(streets.geom) AS geojson,
            ST_Length( ST_Transform(streets.geom,2952) ) AS length_m
        FROM results
        JOIN here.routing_streets_22_2 AS streets USING ( link_dir )
        JOIN here_gis.streets_att_22_2 AS attr 
            ON attr.link_id::int = substring(link_dir,'\d+')::int
        JOIN congestion.network_links_22_2 AS seg_lookup USING ( link_dir )
        ORDER BY seq;
        '''

    stname_query = '''
        SELECT DISTINCT InitCap(st_name) AS st_name
        FROM here.routing_streets_22_2 AS routing
        INNER JOIN here_gis.streets_att_22_2 AS streets USING(link_id)
        WHERE
            routing.source = %(node)s
            OR routing.target = %(node)s;
    '''

    with getConnection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(links_query,
                {"node_start": from_node_id, "node_end": to_node_id}
            )

            links = [
                {
                    'link_dir': link_dir,
                    'name': st_name,
                    'sequence': seq,
                    'segment_id': segment_id,
                    'geometry': json.loads(geojson),
                    'length_m': length_m
                } for link_dir, st_name, seq, segment_id, geojson, length_m in cursor.fetchall()
            ]

            linknames = set( link['name'] for link in links )
    
            cursor.execute(stname_query, {"node": from_node_id})
            start = set( name for (name,) in cursor.fetchall() ) - linknames

            cursor.execute(stname_query, {"node": to_node_id})
            end = set( name for (name,) in cursor.fetchall() ) - linknames

            if(len(start) > 0 and len(end) > 0):
                linkstr = " & ".join(linknames)
                startstr = " & ".join(start)
                endstr = " & ".join(end)

                ststr = linkstr + " from " + startstr + " to " + endstr
            else:
                ststr = "Along " + " & ".join(linknames)

    connection.close()
    return links, ststr