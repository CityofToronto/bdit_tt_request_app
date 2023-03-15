create function get_links_btwn_nodes(_node_start integer, _node_end integer, OUT _node_start_out integer,
                                     OUT _node_end integer, OUT _st_name character varying[],
                                     OUT links character varying[], OUT geometry character varying) returns record
    stable
    strict
    language sql
as
$$
/*
Uses pg_routing to route between the start node and end node on the HERE
links network. Returns inputs and an array of link_dirs and a unioned line
*/

WITH results as (
    SELECT *
    FROM pgr_dijkstra('SELECT id, source::int, target::int, length::int as cost from here_links', _node_start,
                      _node_end)
)

SELECT _node_start, _node_end, array_agg(st_name),array_agg(link_dir), ST_AsGeoJSON(ST_union(ST_linemerge(geom))) as geometry
from results
         inner join here_links on edge = id
$$;

alter function get_links_btwn_nodes(integer, integer, out integer, out integer, out character varying[],
    out character varying[], out varchar) owner to postgres;