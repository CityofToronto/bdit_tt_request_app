# testing MoE's

library('tidyverse')

setwd('C:\\Users\\nwessel\\Documents\\GitHub\\tt_app\\analysis')

purple = '#9e7cbd'
grey = '#4f4c4c'

# plot by month for busiest weekday period
read_csv('results-monthly.csv') %>%
    group_by( dateRange, direction) %>%
    mutate(ttt = mean_travel_time_minutes) %>%
    extract(
        dateRange,
        into=c('fromDate'),
        regex='From ([0-9]{4}-[0-9]{2}-[0-9]{2})'
    ) %>%
    mutate( fromDate= ymd(fromDate) + days(15) ) %>%
    ggplot( aes( x=fromDate, y=ttt, lty=direction ) ) +
        geom_line( size = 1.2, color=grey ) +
        geom_point( color=grey, size=2 ) +
        geom_ribbon(
            aes(ymin = moe_lower_p95/60, ymax = moe_upper_p95/60),
            alpha=0.25
        ) +
        annotate( # approximate dates of installation start and end
            'rect',
            xmin=ymd('2023-09-11'),
            xmax=ymd('2023-10-15'),
            ymin=-Inf,
            ymax=Inf,
            fill=grey,
            alpha=0.2
        ) +
        scale_y_continuous(
            breaks = c(0,2,4,6,8,10,12),
            limits = c(0, NA)
        ) +
        scale_x_date(
            breaks = '1 month',
            minor_breaks = '1 month',
            labels = scales::label_date_short()
        ) +
        labs( title = 'Bloor West weekday travel times between Runnymede & Aberfoyle (PM Peak)' ) + 
        ylab( 'Monthly Average Travel Time (minutes)' ) +
        xlab( 'Month' ) +
        theme_bw()


# plot by time of day, pre- and post-install
read_csv('results-ToD.csv') %>%
    extract(
        timeRange,
        into=c('hour'),
        regex='From ([0-9]+):00'
    ) %>%
    mutate(
        hour = as.numeric(hour),
        period = factor(case_match(
            dateRange,
            'From 2022-11-01 to 2023-04-01' ~ 'before',
            'From 2023-11-01 to 2024-04-01' ~ 'after'
        ), levels=c('before','after')),
    ) %>%
    ggplot( aes( x=0.5+hour, y=mean_travel_time_seconds, lty=direction ) ) +
    geom_line( aes(color=period,), size = 1 ) +
    geom_ribbon(
        aes(ymin = moe_lower_p95, ymax = moe_upper_p95, fill=period),
        alpha=0.25
    ) +
    scale_color_manual(values=c('before'=grey,'after'=purple)) +
    labs( title = 'Bloor West travel times between Runnymede & Aberfoyle' ) + 
    ylab( 'Travel Time (seconds)' ) +
    xlab( 'Hour of day' ) + 
    scale_y_continuous(
        breaks = 60 * seq(0,14,1),
        minor_breaks = NULL,
        limits = c(0, NA)
    ) +
    scale_x_continuous(
        breaks = seq(0,24),
        minor_breaks = c(),
    ) +
    theme_bw()
