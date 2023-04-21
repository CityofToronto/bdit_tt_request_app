# Development Planning
This is meant to be a rough sketch of the direction this project is going in. 

## Near-term goal
Get the app to return the results of a very simple travel time aggregation using the congestion network in the (current) standard way. 

### Deliverables:
* CSV format downloads from browser
* gives mean travel time over a given time/date period
* able to exactly reproduce (a subset of) the results of a recent data request

### Design
1. Copy a recent data request's SQL more or less verbatim into a new enpoint/route the backend code
2. Slot in the variables delivered from the front end UI
    * date range
    * time range
    * route
    * DoW, holidays, etc
3. Ensure that the qury runs reasonably quick for a very simple query (e.g. < 15 seconds)
4. Ensure that the output data format is intelligible. Each row chould have columns
    * from_street
    * to_street
    * via_street
    * time_range
    * date_range
    * holidays (t/f)
    * dow (list of days of week in analysis)
    * mean_travel_time
