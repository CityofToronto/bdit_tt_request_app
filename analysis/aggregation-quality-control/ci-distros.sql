CREATE OR REPLACE VIEW nwessel.ci_based_distros AS

WITH aggs AS MATERIALIZED (
    -- get some random aggregations with similar rrttt
    SELECT
        row_number() OVER () AS agg_num,
        *,
        (ci_upper - ci_lower) / avg_tt AS rrttt -- range relative to travel time
    FROM gwolofs.congestion_segments_monthly_bootstrap
    WHERE
        n BETWEEN 20 AND 50
        AND ((ci_upper - ci_lower) / avg_tt) > 0.1
        AND ((ci_upper - ci_lower) / avg_tt) < 0.11
    ORDER BY random()
    LIMIT 30
)

SELECT
    agg_num,
    raw.tt
FROM aggs
JOIN gwolofs.congestion_raw_segments AS raw
    ON
        aggs.segment_id = raw.segment_id
        AND aggs.mnth = DATE_TRUNC('month', raw.dt)
        AND
            CASE
                WHEN aggs.is_wkdy THEN EXTRACT('ISODOW' FROM raw.dt) IN (1, 2, 3, 4, 5)
                ELSE EXTRACT('ISODOW' FROM raw.dt) IN (6, 7)
            END
        AND aggs.hr = raw.hr
ORDER BY
    agg_num
