
library('tidyverse')
library('dbplyr')

con <- DBI::dbConnect(
    RPostgres::Postgres(), 
    host = 'trans-bdit-db-prod0-rds-smkrfjrhhbft.cpdcqisgj1fj.ca-central-1.rds.amazonaws.com',
    user = 'nwessel',
    dbname = 'bigdata',
    password = rstudioapi::askForPassword("Database password")
)

# look at hourly binning
tbl( con, in_schema('here','ta_path') ) %>%
    filter( dt == '2024-07-18' ) %>%
    mutate( hours = sample_size * ((length / 1000) / mean) ) %>%
    group_by( tod ) %>% 
    summarize(
        # x 12 because otherwise we'd have the number of hours in a five-minute bin
        probe_count = 12 * sum(hours)
    ) %>%
    ggplot( aes(x = tod, y = probe_count) ) + 
        geom_line()
