# make histograms of those distributions
library('tidyverse')
library('dbplyr')

con <- DBI::dbConnect(
    RPostgres::Postgres(), 
    host = 'trans-bdit-db-prod0-rds-smkrfjrhhbft.cpdcqisgj1fj.ca-central-1.rds.amazonaws.com',
    dbname = 'bigdata'
)

sampled_aggs = tbl( con, in_schema('gwolofs','congestion_segments_monthly_bootstrap') ) %>%
    filter(
        n >= 20,
        n <= 50,
        ((ci_upper - ci_lower) / avg_tt) > 0.1,
        ((ci_upper - ci_lower) / avg_tt) < 0.11    
    ) %>%
    mutate(
        i = row_number(),
        rrttt = (ci_upper - ci_lower) / avg_tt
    ) %>%
    select(i, segment_id, mnth, is_wkdy, hr, n, rrttt) %>%
    arrange(random()) %>%
    head(30)

# this table has ~1B rows; select carefully!
obs = tbl( con, in_schema('gwolofs','congestion_raw_segments') ) %>%
    mutate(
        mnth = date(floor_date(dt,unit='month')),
        is_wkdy = wday(dt, week_start=1) %in% c(1, 2, 3, 4, 5)
    ) %>%
    inner_join( sampled_aggs ) %>% 
    collect() %>%
    mutate( i = factor(i) )

obs_summary = obs %>%
    group_by(i) %>%
    summarize(
        median_tt = median(tt),
        mean_tt = mean(tt)
    )

obs %>%
    ggplot( aes(x=tt) ) +
    geom_histogram() +
    geom_vline(
        data = obs_summary,
        aes(xintercept=mean_tt),
        color='red'
    ) +
    geom_vline(
        data = obs_summary,
        aes(xintercept=median_tt),
        color='blue'
    ) +
    facet_wrap(vars(i), scales='free') +
    xlim(0,NA)
