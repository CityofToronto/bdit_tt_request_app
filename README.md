# Travel Time Request App

[Go to the Travel Time Request App!](https://trans-bdit.intra.prod-toronto.ca/traveltime-request/) (you must be inside the City network)

## About
The Travel Time Request App is a simple React application designed to help City staff find averaged motor vehicle travel times for selected corridors within the city for any time since ~ 2012.

This app was originally developed as a [class project by U of T students](https://www.youtube.com/watch?v=y6lnefduogo) in partnership with the City, though it has undergone substantial development by the Data & Analytics Unit since then. 

## Methodology

Data are sourced from [HERE](https://github.com/CityofToronto/bdit_data-sources/tree/master/here). Formerly these needs were handled through a more time-consuming data request process.

### Other means of estimating travel times

The City also has [bluetooth sensors](https://github.com/CityofToronto/bdit_data-sources/blob/master/bluetooth/README.md) at some intersections which can be used to get a more reliable measure of travel time. These sensors pick up a much larger proportion of vehicles than the HERE data, making it possible to do a temporally fine-grained analysis. The sensors however are only in a few locations, especially in the downtown core and along the Gardiner and DVP expressways.  

## Development

For information on development and deployment, see [Running the App](./running-the-app.md).
