# Toronto Transportation Traffic Data Filter Web Application / Team Gabriel

## Product Details
 
#### Q1: What are you planning to build?

We are planning on building a web-app that allows users to select on a map a route that they wish to take, what days they may take it and at what time and having the app return to the user the average travel time along that route. We are planning to build a web-app with a pre-built database that allows internal staff and consultants of the partner to be able to self-serve their traffic speed data requests. The users will be able to select the streets for which they want data on a map by either drawing a project area and selecting corridors or drawing individual segments and then entering time of week parameters (defining multiple time periods by selecting days of week and time of day) and calendar periods (months) and receiving a csv (or shapefile) of output.

#### Q2: Who are your target users?

Our target users are the internal staff at Toronto transportation and other third parties who are granted access. They will be using this site as a streamlined method to fetch data from the database.

#### Q3: Why would your users choose your product? What are they using today to solve their problem/need?

Currently the internal staff and consultants at Toronto Transportation Services need to format the data fetch requests to their PostgreSQL database by hand input, which is inefficient and inconvenient for members with little database background knowledge. To solve this problem, our product provides users with a human-readable map interface, which allows users to select two points on the map and the time stamps to fetch relevant traffic data they want. For example, if a staff wants to get the traffic data between Bahen Center and Robarts Library: previously, the user needed to get the geological data of two points and manually write database fetch request; by using our product, the user only needs to click on two points on the map (the route will be automatically adjusted), select time intervals in a form, and then our app handle all the rest and fetch the data. The ultimate goal includes:
 * Save users’ time from several minutes (for non-technical staff maybe longer) to few seconds (for anyone just some clickings on locations and timestamps)
 * More accurate data, by reducing chance of wrong data fetch request input (human mistake) and assists in adjusting routes between points
 * Improve self-serve data literacy amongst internal staff, by allowing anyone with some experience or concept in electronic maps to serve themselves with traffic data efficiently and conveniently 

#### Q4: How will you build it?

Please see CSC301_ProjectViews.pdf for the mockup of the software.$

For backend we plan to use PostgreSQL for the database, pgRouting for calculating the time travel between two points, Python Flask for api’s communicating between the front and back end, Python3 for processing the requests, and Flask-SQLAlchemy for querying the database.

The frontend of the project will be written in javascript, using the react library for the application. We will be using the Material UI library for designing the frontend. For the map overlay that the project needs, we will be using the Mapbox library. Finally, for testing the frontend we will be using the Jest testing framework.

Our testing strategy for this project will be that after a feature has been implemented, tests will be written simulating expected user inputs and ensuring that the implemented functionality works correctly.

#### Q5: What are the user stories that make up the MVP?
 * Internal staff
    * As the primary user of this web application, I want to easily and quickly fetch data from the database in order to self-serve my traffic speed data requests.
* Data Scientist 
    * As a potential user of the app, I want to be able to programmatically query the app for traffic information and have it be exported in order to easily analyze it.
 * Third party external consultants
    * As a potential user of the app, I want to also be able to use the app like the internal staff  in order to self-serve my traffic speed data requests.
 * Developers 
    * As an admin of the app, I want to have users requests to be standardized in order to be easily processed.