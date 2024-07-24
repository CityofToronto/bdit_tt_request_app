# Travel Time Request App

[Go to the Travel Time Request App!](https://trans-bdit.intra.prod-toronto.ca/traveltime-request/) (You must be on a computer inside the City's network.)

## About
The Travel Time Request App is a simple web application designed to help City staff find averaged motor-vehicle travel times for selected corridors within the city for any time since ~2017.

This app was originally developed as a [class project by U of T students](https://www.youtube.com/watch?v=y6lnefduogo) in partnership with the City, though it has undergone substantial development by the Data & Analytics Unit since then. 

## How to use the app
When you [visit the app](https://trans-bdit.intra.prod-toronto.ca/traveltime-request/), you will be prompted to add/create at least one of each of the following:
* a corridor, drawn on the map
* a time range, given in hours of the day, 00 - 23
* a date range (note that the end of the date range is exclusive)
* a day of week selection
* a selection of whether or not to include statutory holidays 

The app will combine these factors together to request travel times for all possible combinations. If one of each type of factor is selected, only a single travel time will be estimated with the given parameters. 

Once each factor type has been validly entered it will turn from red to green. Once one or more of each type of factor is ready, a button will appear allowing you to submit the query. Once the data is returned from the server (this can take a while when there are many combinations to process) you will be prompted to download the data as either CSV or JSON.

If you have any trouble using the app, please send an email to Nate Wessel (nate.wessel@toronto.ca) or feel free to open an issue in this repository if you are at all familiar with that process.

## Outputs

The app can return results in either CSV or JSON format. The fields in either case are the same:

| Field | Description |
|----|----|
| `URI` | The URI is the API endpoint that corresponds to the travel time request for each record. It can serve as a unique ID for each record. The URI allows us to reconstruct a request precisely and gather additional information to diagnose issues and verify data quality. |
| `routeStreets` | The names of the streets along the corridor. I.e. the path between A and B. |
| `direction` | The approximate compass direction of travel for a corridor e.g. "Westbound". |
| `startCrossStreets` | The names of any cross-street(s) at the start of the corridor. If the corridor starts mid-block then coordinates of that point will be returned instead. |
| `endCrossStreets` | The names of any cross-street(s) at the end of the corridor. If the corridor ends mid-block then coordinates of that point will be returned instead. |
| `timeRange` | Text description of the time-of-day range included in the query. |
| `dateRange` | Text description of the range of dates included in the query. |
| `daysOfWeek` | Text description of the days of week included in the query.  |
| `holidaysIncluded` | Boolean, indicating if statutory holidays where (True) or were not (False) included in the query. If there are no holidays within the date range, will return `NA`. |
| `hoursInRange` | The total number of hours that are theoretically within the scope of the query's various parameters. This does not imply that data is/was available at all times. It's possible to construct requests with zero hours in range such as e.g `2023-01-01` to `2023-01-02`, Mondays only (There's only one Sunday in that range). Impossible combinations are included in the output for clarity and completeness but are not actually executed against the API and should return an error. |
| `mean_travel_time_minutes` | The mean travel time in minutes is given as a floating point number rounded to three decimal places. Where insufficient data was available to complete the request, the value will be null. |
| `mean_travel_time_seconds` | Same as above, but measured in seconds. |


## Methodology

Data for travel time estimation through the app are sourced from [HERE](https://github.com/CityofToronto/bdit_data-sources/tree/master/here)'s [traffic API](https://developer.here.com/documentation/traffic-api/api-reference.html) and are available back to about 2017. HERE collects data from motor vehicles that report their speed and position to HERE, most likely as a by-poduct of the driver making use of an in-car navigation system connected to the Internet.

The number of vehicles within the City of Toronto reporting their position to HERE in this way has been estimated to be around 2,000 to 3,000 vehicles during the AM and PM peak periods, with lower numbers in the off hours. While this may seem like a lot, in practice many of these vehicles are on the highways and the coverage of any particular city street within a several hour time window can be very minimal if not nil. For this reason, we are currently restricting travel time estimates to "arterial" streets and highways.  

Travel times are provided to us in the form of _average speeds_ along links of the street network in 5-minute time bins. Given the sparseness of the vehicle probe data, most links, in most time bins are empty. The scond most common sample size is a single vehicle observation.

Before generating an averaged travel time, we do several steps to aggregate and average this sparse data into larger units. 
* We aggregate _links_ spatially into longer _corridors_ between major intersections
* We aggregate _corridors_ temporally into one-hour bins

We generate averaged travel times from these one-hour-corridor bin units where one or more vehicles has travelled 80% or more of the length of the corridor.

We aggregate corridors together spatially as necessary into larger corridors where 80% or more of segments have met the criteria above. Where data is missing it is extrapolated at the average speed over the rest of the length.

### Other means of estimating travel times

The City also has [bluetooth sensors](https://github.com/CityofToronto/bdit_data-sources/blob/master/bluetooth/README.md) at some intersections which can be used to get a more reliable measure of travel time. These sensors pick up a much larger proportion of vehicles than the HERE data, making it possible to do a temporally fine-grained analysis. The sensors however are only in a few locations, especially in the downtown core and along the Gardiner and DVP expressways.  

## Development

For information on development and deployment, see [Running the App](./running-the-app.md).
