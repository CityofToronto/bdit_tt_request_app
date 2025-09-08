CREATE TABLE nwessel.cached_tt_routes (
    uri_string text CHECK(uri_string ~ '^\/link-nodes\/here\/\d+\/\d+\?map_version=\d{2}_\d$'),
    commit_hash text NOT NULL,
    results jsonb NOT NULL,
    first_requested timestamptz DEFAULT NOW(),
    PRIMARY KEY (uri_string, commit_hash)
);

GRANT SELECT, INSERT ON nwessel.cached_tt_routes TO tt_request_bot;
GRANT SELECT ON nwessel.cached_tt_routes TO bdit_humans;

COMMENT ON TABLE nwessel.cached_tt_routes IS 'Optional cache for routed corridors for the Travel Time App';
