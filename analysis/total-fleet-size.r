
library('tidyverse')
library('dbplyr')

con <- DBI::dbConnect(
    RPostgres::Postgres(), 
    host = 'insert DB host here',
    user = 'nwessel',
    dbname = 'bigdata',
    password = rstudioapi::askForPassword("Database password")
)

# The idea here is to convert average speeds and lengths of links into *time*
# The total amount of time spent traveling by vehicles in a given unit of time
# just is the average total number of vehicles reporting their locations to Here
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
