library('tidyverse')
library('dbplyr')

con <- DBI::dbConnect(
    RPostgres::Postgres(),
    host = 'trans-bdit-db-prod0-rds-smkrfjrhhbft.cpdcqisgj1fj.ca-central-1.rds.amazonaws.com',
    user = 'nwessel',
    dbname = 'bigdata',
    password = rstudioapi::askForPassword("Database password")
)

# a set of link_dirs in sequential order along a corridor
linkdirs = c(
    '949250735F',
    '949250736F',
    '29577082F',
    '1258753705F',
    '1327809912F',
    '1327809913F',
    '1258753947F',
    '1258940597F',
    '1258940598F'
)

# simple query for all possible time bins on any given day
bins = tbl( con, in_schema('here','ta_path') ) %>%
    filter( dt == '2025-01-01' ) %>%
    select( tod ) %>%
    distinct() %>%
    collect() %>%
    # join with link_dirs to cover all possible values for the plot
    cross_join( tibble( link_dir = linkdirs ) )

tbl( con, in_schema('here','ta_path') ) %>%
    filter(
        dt == '2025-03-05',
        link_dir %in% linkdirs
    ) %>%
    select( link_dir, tod, length, mean, sample_size ) %>%
    collect() %>%
    right_join( bins ) %>%
    mutate( link_dir = factor( link_dir, levels = linkdirs ) ) %>%
    ggplot( aes( x = factor(link_dir), y = tod ) ) +
        geom_tile( aes(fill=sample_size), colour = 'white' ) + 
        scale_y_time( # how to reverse this??
            limits = c(
                hms('00:00:00'),
                hms('24:00:00')
            )
        ) +
        scale_x_discrete( guide=  guide_axis(angle = 45) ) +
        scale_fill_steps(
            breaks = seq(1, 6),
            na.value = '#eee',
            transform='reverse'
        ) +
        theme_minimal()
