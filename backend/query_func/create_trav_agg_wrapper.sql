create or replace function fetch_trav_data_wrapper(time_periods time_period[], segments link_segment[],
                                                   start_date date, end_date date,
                                                   days_of_week int[], include_holidays bool)
    RETURNS SETOF aggregation_ret_type AS
$$

set enable_seqscan = false;

SELECT *
FROM fetch_aggregated_travel_data(time_periods, segments,
                                  start_date, end_date,
                                  days_of_week, include_holidays);

$$ LANGUAGE sql volatile security definer ;