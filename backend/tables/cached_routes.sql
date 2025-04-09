CREATE TABLE nwessel.cached_tt_routes (
    node_start bigint NOT NULL CHECK (node_start >= 0),
    node_end bigint NOT NULL CHECK (node_end >= 0),
    map_version text NOT NULL, --REFERENCES here.street_valid_range (street_version),
    commit_hash text NOT NULL,
    results jsonb NOT NULL,
    first_requested timestamptz DEFAULT NOW(),
    PRIMARY KEY (node_start, node_end, map_version, commit_hash)
);

GRANT SELECT, INSERT ON nwessel.cached_tt_routes TO tt_request_bot;
GRANT SELECT ON nwessel.cached_tt_routes TO bdit_humans;

COMMENT ON TABLE nwessel.cached_tt_routes IS 'Optional cache for routed corridors for the Travel Time App';
