CREATE TYPE closest_node_ret_type AS
(
    id            integer,
    intersec_name text,
    geom_json     text,
    distance      double precision
);

CREATE OR REPLACE FUNCTION get_closest_nodes(longitude double precision, latitude double precision)
    RETURNS SETOF closest_node_ret_type AS
$$
WITH distances AS (SELECT node_id, st_transform(geom, 2952) <-> st_transform(st_setsrid(st_makepoint(longitude, latitude), 4326), 2952) AS distance
                   FROM here_nodes)
SELECT here_nodes.node_id, intersec_name, st_asgeojson(geom), distance
FROM here_nodes
         JOIN distances ON here_nodes.node_id = distances.node_id
    ORDER BY distance
    LIMIT 10;
$$
    language sql
    stable
    strict;
