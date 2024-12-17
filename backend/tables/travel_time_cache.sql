CREATE TABLE nwessel.cached_travel_times (
    uri_string text CHECK(uri_string ~ '^\/\d+\/\d+\/\d{1,2}\/\d{1,2}\/\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}\/(true|false)\/[1-7]{1,7}$'),
    commit_hash text,
    results jsonb NOT NULL,
    PRIMARY KEY (uri_string, commit_hash)
);

GRANT SELECT, INSERT ON nwessel.cached_travel_times TO tt_request_bot;
