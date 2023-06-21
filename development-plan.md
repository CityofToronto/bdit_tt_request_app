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
Frontend should regroup around the simplest possible thing
* do a single aggregation
    * one time range X one date range X one route
* display the results or offer them as a one-line CSV download

Second phase then can work to restore _some_ of the existing, more complex functionality for combinations of values
* multiple date ranges
* multiple time ranges
* multiple routes
* plus all combinations of the above

These will rely on the same backend API but just `await` a set of parallel promises, the results to be combined in the frontend before download.

Possible then to display progress for big queries?

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