library('tidyverse')

setwd('C:\\Users\\nwessel\\Downloads')

read_csv('corridor-windows-250m-2tail.csv') %>%
    mutate(
        change = if_else(tt_before > tt_after, 'decrease', 'increase'),
        p = if_else(p <= 0.05, p, 1)
    ) %>%
    ggplot() +
        geom_rect(
            aes(
                xmin = windowStartM,
                xmax = windowEndM,
                ymin = 0,
                ymax = log(p),
                fill = change
            ),
            alpha = 0.1
        ) +
        scale_fill_manual(values = c(
            'increase' = 'red',
            'decrease' = 'green'
        )) +
        scale_x_continuous(
            # label cross streets by distance from start
            minor_breaks = NULL,
            breaks = c(0,371,657,1200,1700,2000,2800,3000,3100,3300,3500,3700),
            labels = c('Aberfolye','Montgomery','Royal York','PED','Kingsway','Old Mill Trail','S Kingsway','Jane','Armadale','Windermere','Durie','Runnymede')
        ) +
        scale_y_reverse() +
        labs(
            title='Significance of Eastbound travel time changes',
            y='log(P)'
        )

