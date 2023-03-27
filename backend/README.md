# Backend Files & Functions
Below is a list of backend processes that can be accessed . 

## `__init__.py`
Initializes and declares the Flask App object, with a ton of unnecessary fields. Needs some cleanup

## `file_util.py`
Utility functions that create excel/csv files containing travel time data selected by the user.

## `models.py`
Declares the database model (postgres), created using the sqlalchemy package. Includes fields `link_dir`, `link_id`, `st_name`, `source`, `target`, `length`, `geom`

## `parse_util.py`
Utility functions that parse travel time requests to the app by users

## `routes.py`
Contains Also has URL routes for functions in the backend with Flask. 

### `get_closest_node(longitude, latitude)`
Corresponds to the API function `getClosestNode`. Gets the 10 closest nodes from the given coordinate. This function uses database function get_closest_nodes to fetch series of closest nodes to the given longitude and latitude, sorted by ascending distance order.
    Only points with distance less than 5 are returned by this function.

:param longitude: the longitude of the origin point
:param latitude: the latitude of the origin point
:return: JSON of an array containing the satisfying nodes.
        The array is sorted in ascending distance order. node object keys: node_id(int),
        geometry(geom{type(str), coordinates(list[int])}), name(str)


### `getLinkBetweenNodes`
API function that returns the shortest link between a given series of nodes. Has the following variants in python:
#### `get_links_between_two_nodes(from_node, to_node)`
#### `get_links_between_multi_nodes()`

### `get_date_bounds()`
Corresponds to the API function `getDateBoundary`. 
Gets the date time boundary of the data sets.


### `get_links_travel_data_file()`
Corresponds to the API function `getTravelDataFile`.
Gets the travel data file (csv) of each of the given series of links in the specified series of time range.



## Queries
### `create_trav_agg.sql`
CREATE function for `fetch_aggregated_travel_data`
Aggregates total travel time and other stats across all links selected by the user

Params:
- time_periods time_period[]
- segments link_segment[]
- start_date date
- end_date date
- days_of_week int[]
- include_holidays bool

### `create_closest_node.sql`
CREATE function for `get_closest_nodes`


### `create_datetime_bin.sql`
CREATE function for `public.datetime_bin`

### `create_get_links.sql`
CREATE function for `get_links_btwn_nodes`

### `create_trav_agg_wrapper.sql`
CREATE function for `fetch_trav_data_wrapper`
One line of code to SELECT data from `fetch_aggregated_travel_data`.
