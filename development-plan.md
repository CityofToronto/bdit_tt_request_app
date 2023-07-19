# Development Planning
This is meant to be a rough sketch of the direction this project is going in. 

## Near-term goal
Get the app to return the results of a simple travel time aggregation using the congestion network in the (currently) standard way.

### Deliverables:
* CSV format downloads from browser
* gives mean travel time over a given time/date period
* able to exactly reproduce some of the results of a recent data request

### Backend Design
1. ~~Copy a recent data request's SQL more or less verbatim into a new endpoint/route the backend code~~
2. Slot in the variables delivered from the front end UI
    * ~~date range~~
    * ~~time range~~
    * ~~route (defined by start/end nodes)~~
    * day of week
    * holidays
3. Ensure that the qury runs reasonably quick for a simple query (e.g. < 10 seconds)
    * optimize and refactor if necessary
4. Ensure that the output data format is as needed. Each result should have fields
    * mean_travel_time in seconds
    * description of route
        * from_street text
        * to_street text
        * via_street text
        * geometry geojson
        * hash of the geom for easy equality checking
    * sample data
        * total span of time potentially included in aggregation
        * % of that time/space with 1 + actual observations
        * (together, these can be used to estimate the sample size)

### Frontend design
The interface should be more of a step-by step walk-through and less of a here-are-all-the-controls-at-once.

We can start with the map, side panel permanently open. The panel has a welcome message with a quick description of the app. 
The user is then prompted to identify a corridor by clicking intersections on the map for a start and end node. The routing will display automatically. They may need to add or drag a node at this point and that should be indicated once the initial route is on the map. 

A corridor has been created! Would they like to add another? Same process, corridors stacking up as added in accordion divs, with the open div indicated as active on the map. Only one open at a time. 

Once a corridor with 2+ nodes has been created, a section on the bottom haf of the panel appears with the temporal options. The welcome message from the top disappears. These options come in two parts:
* times "Time Periods"
* dates "Date Ranges" (dow, date range, holiday exclusion)

These options too are each in sets of collapsible divs with only the active one open.

When a Corridor + a Date Range + a Time Period have been created, the Get Travel Times option appears.

All combinations of the three main sections will be combined together and sent in batches to the backend. We can just `await` a set of parallel promises, the results to be combined in the frontend before download.

Possible then to display progress for big queries by the % of promises returned??

## Medium Term Goals
* Improve the code
    * clean up / refactor / replace big chunks into smaller bits
* Improve / validate the aggregation methods
    * be able to directly compare results in output
    * gain extra stats beyond mean travel time (percentiles, sample size, etc)
    * speed up
* Improve the interface
    * store intermediate data (e.g. route, time, date selections)
        * e.g. a way of saving requests contra results
    * better display multiple routes, esp. where overlapping

## Long Term Goals
* Precisely estimate _future_ travel times
    * account for the fact that foreknowledge of events will interfere with the timeline
        * avoid paradoxes
* World domination
