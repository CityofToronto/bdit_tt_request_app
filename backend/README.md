# Backend Files & Functions
Below is a list of backend processes that can be accessed . 

## `__init__.py`
Initializes

## `file_util.py`
Utility functions that create excel/csv files containing travel time data selected by the user.

## `routes.py`
Contains Also has URL routes for functions in the backend with Flask. 

### `get_closest_node(longitude, latitude)`
Corresponds to the API function `getClosestNode`. Gets the 10 closest nodes from the given coordinate. This function uses database function get_closest_nodes to fetch series of closest nodes to the given longitude and latitude, sorted by ascending distance order.Only points with distance less than 5 are returned by this function.
    :return: JSON of an array containing the satisfying nodes.
        The array is sorted in ascending distance order. node object keys: node_id(int),
        geometry(geom{type(str), coordinates(list[int])}), name(str)
Linked URL: `/closest-node/<longitude>/<latitude>`


### `getLinkBetweenNodes`
API function that returns the shortest link between a given series of nodes. 
    :return: JSON representing an array of link objects, which are the shortest links connecting given points.
            Link object keys: link_dir(str), link_id(int), st_name(str),
            source(int), target(int), length(float),
            geometry(geom{type(str), coordinates(list[int])})
Has the following variants in python:
#### `get_links_between_two_nodes(from_node, to_node)`
Linked URL: `/link-nodes/<from_node_id>/<to_node_id>`
#### `get_links_between_multi_nodes()`
Linked URL: `/link-nodes`

### `get_date_bounds()`
Corresponds to the API function `getDateBoundary`. 
Gets the date time boundary of the data sets.
    :return: JSON containing two fields: start_time and end_time
Linked URL: `/date-bounds`

### `get_links_travel_data_file()`
Corresponds to the API function `getTravelDataFile`.
Gets the travel data file (csv) of each of the given series of links in the specified series of time range.
    :return: a file containing requested travel data
Linked URL: `/travel-data-file`