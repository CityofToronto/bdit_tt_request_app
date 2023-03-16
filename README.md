# Travel Time Request App

## How to create segments
CS Students from UofT created a web application for handling travel time data requests. Currently only the segment creation piece is ready to use, segments can be drawn following the steps below:

1. Make sure you are on the network.

2. Navigate to the app with the suffix : `traveltime-request/`

3. To draw a segment, you will need to place at least two nodes on the map which represents the start and end point of the segment. Each node can be placed by clicking on their desired location on the map. The order of placing each node is important as it dictates the direction of how the segment will be drawn. 
*More nodes can be added along the segment for added accuracy


4. Nodes can be dragged to move to a new location, or deleted by clicking on the Remove Last Node button on the bottom right corner. 

 ![image](https://user-images.githubusercontent.com/46324452/108752430-70112e00-7511-11eb-9573-dd375dd3de19.png)

5. Once you placed both nodes, you can click on the Update & Display Links button to display the segment.

 ![image](https://user-images.githubusercontent.com/46324452/108752440-730c1e80-7511-11eb-98e9-4de10bd80bb8.png)

6. To draw the reverse direction of the same segment, you can enter the segment number in the Reverse Seg # in the bottom right corner, then click Reverse. In the example below, a new northbound segment #1 was create by using the southbound segment #0. You might need to drag and update links to ensure the reversed segment was correctly drawn, especially for roads with medians. 

![image](https://user-images.githubusercontent.com/46324452/108752449-756e7880-7511-11eb-82e5-59abd645ae0a.png)


7. To draw a new segment, click New Segment to before placing new nodes. 

 ![image](https://user-images.githubusercontent.com/46324452/108752452-77383c00-7511-11eb-9b5a-40f3664b5e07.png)

8. After drawing all the segments, and making sure all links are visible on the map, you can download the data by first clicking on Edit Query, then select geojson as file type on the top left corner, and lastly click on Get Displayed Links Data.  

![image](https://user-images.githubusercontent.com/46324452/108752457-799a9600-7511-11eb-9fde-08bdd7751c63.png)

**Important Note:** [due to a bug in the app's implementation of creating GeoJSON for multiple segments at once](https://github.com/CityofToronto/bdit_tt_request_app/issues/1), the output GeoJSON is **invalid**. You will need to manually edit the GeoJSON by either cutting segments into new files or adding the line objects within the `"features"` array. 


# Toronto Transportation Traffic Data Filter Web Application  

## Description 

 * **Context**:  The toronto big data innovation team handles data requests from a wide variety of clients including academia and industry. These data requests are about traffic travel times across the City of Toronto. They collect and store data of roads all across Toronto and the expected travel times on the roads at any time of day, at any time of the year.
 
 * **Problem**:  Queries from these clients are often not specific and not in the proper format, this causes the team to spend a lot of time formatting the queries into something usable. They needed a visual and user-friendly web-application in order to standardize the process to make queries so that users can easily self-serve the travel time data on the city of toronto without needing the team to intervene.
 
 * **Description of Application**: This web-application purpose is to streamline the way users can fetch data from the toronto big data innovation team’s database. Using a map, users can create sequences of nodes in order to designate paths on which to query the data. The user can then use the sidebar to choose specific times during a day, across a period in the year to receive a data file (csv, xmlx) as output. This gives users the ability to shape their desired query through a visual system which is intuitive and fast. This also removes the need for the big data innovation team to intervene with queries as everything can be done by the user.

## Deliverable 4 Video Demo
https://www.youtube.com/watch?v=y6lnefduogo

## Key Features

* Header:
   * Longitude:
     * Users can see the current longitude of the centre location of the map.
   * Latitude:
     * Users can see the current latitude of the centre location of the map.
   * Zoom:
     * Users can see the current zoom of the map.
   * Current Sequence Number:
     * Users can see the current sequence number that they are working on the map.
* Map Content:
   * Node:
     * Add a new node:
       * Users can place a new node on the map by clicking their desired location on the map. The sequence number and the node number of the newly created node will be shown if the user hover on the node.
     * Drag an existing node:
       * Users can drag an existing node to a new location by simply dragging the node on the map.
     * Remove the last node:
       * Users can remove the last node they added by clicking the Remove Last Node button. 
   * Sequence:
     * Add a new sequence:
       * Users can start a new sequence by clicking the New Sequence button. Each sequence has a unique color, and nodes that are in the same sequence will have the same color.
     * Reverse an existing sequence:
       * Users can reverse an existing sequence by inputting the sequence number and clicking the Reverse button. New nodes will be created at the same location of the nodes in the selected sequence but in reverse order.
   * Link:
     * Get links among all present nodes:
       * Users can get links among all present nodes by clicking the Update & Display Links button. Created links are directed by the arrow drawn on the line, and colored by their corresponding sequence color. For roads where two links of opposite directions cross each other, a Bi-direction arrow will be drawn on top of the link indicating the query will contain both directions.
     * Remove all drawn links:
       * Users can remove all the drawn links by clicking the Remove All Links button.
   * Map:
     * Reset Map:
       * Users can Reset the map by clicking the Reset Map button.
* SideBar:
   * Time Range:	
     * Create Multiple time range:
       * Users can input multiple time ranges by using the add new time range / replicate current time range button.
     * Remove an existing time range:
       * Users can remove an existing time range by using the remove current time range button.
     * Preset time range:
       * Users can select a preset time range by using the apply preset dropdown.
     * Start-end date:
       * Users can input the start-end date of their current time range by using the calendar icon.
     * Start-end time:
       * Users can input the start-end time of their current time range by using the corresponding input boxes.
     * Days of the week:
       * Users can select the days of the week of the current time range by checking the corresponding checkboxes.
     * Holidays:
       * Users can include holidays by checking the Include Holidays checkbox.
   * File Type:
     * Choose the type:
       * Users can select the file type by using the File Type dropdown, and the generated data file will be in the selected type on all the previously inputted time periods.

## Instructions

 * Nodes
   * Node is the base unit of all what you can create on the map.
   * Creation
     * By clicking on the map, a node will be created.
     * The position of the node will be adjusted to the closest position where there is a valid node recorded in the database. For example, if you click at the center of Queen’s Park’s green area (well, there is certainly no way to have a traffic node on the grass), a node will be created at the road on the side.
     * The color of the node marker depends on the sequence it lies in. More details in “Sequences” section.
     * By hovering up on a node, a popup will display the node number and the sequence number of the node, which is helpful to identify each node.
   * Modification
     * By dragging a node around and releasing it, you are able to modify the node’s position. Similar to the creation of nodes, the node will be adjusted to the closest position where there is a valid node recorded in the database. For example, if you “accidentally” drag a node to Washington, D.C., the node will be forced to return to some position near the south border of Toronto.
     * While the dragging and adjusting are ongoing, you are unable to do any modifications on the map.
   * Deletion
     * By clicking the “Remove Last Node” button at the bottom right corner, you are able to remove the last node you created from the map.
     * By clicking the “Reset Map” button at the bottom right corner, you are able to remove all components created on the map, including all the nodes.
 * Links
   * A link is the bridge(or route) between two nodes.
   * Creation
     * By clicking the “Update & Display Links” button at the bottom right corner, you are able to create and display all links for every pair of consecutive nodes within every sequence. 
     * The color of the link depends on the sequence it lies in. The links and nodes are in the same color if they belong to the same sequence. More details in “Sequences” section.
     * Every link has some arrows to indicate the direction it goes. Normally, the arrows are single arrow.
     * If a link overlaps with another link in reversed direction, the shared parts will have double arrows instead of regular single arrows.
     * The number of arrows on links depends on the zoom scale.
   * Modification
     * You can modify any links by changing the positions of its two end nodes.
     * To update the links, you need to click the “Update & Display Links” at the bottom right corner.
   * Deletion
     * You can delete a link by removing one of its end nodes. 
     * By clicking the “Reset Map” button at the bottom right corner, you are able to remove all components created on the map, including all the links.
 * Sequences
   * A sequence is a group of nodes and the links between nodes.
   * Creation
     * There is a default sequence(which is sequence 0). Additionally, you can create a new sequence by clicking the “New Sequence” button at the bottom right corner. After successful creation, you can add nodes for the new sequence.
     * To let you distinguish from various sequences, nodes and links in different sequences are granted different colours.
     * If a sequence share some links with other existing links but in a reversed direction, the shared links will have double arrows instead of regular single arrows.
   * Modification
     * You can modify any sequence by changing the position of its nodes.
     * You can modify a sequence by removing its nodes if the sequence is the lastly created sequence..
     * By typing an existing sequence number and clicking the “Reverse” button at the bottom right corner, you can create a reversed version of an existing sequence with a different colour for nodes. Notice that the reversed version of a sequence doesn’t necessarily share the same links as the original one. If they share some links, the shared links will have double arrows on them instead of regular single arrows. You can reverse a sequence as many times as you want.
   * Deletion
     * You can delete a sequence by removing all of its nodes if the sequence is the lastly created sequence.
     * By clicking the “Remove All Links” button at the bottom right corner, you can remove all existing links.
     * By clicking the “Reset Map” button at the bottom right corner, you can remove all components created on the map, including all the sequences.
 * Data
   * The main purpose of the application is to get the travel data of links which the user wants to investigate.
   * After setting up the nodes, links, and sequences on the map, you are ready to go to get the travel data file. But before that, you need to open the sidebar via the “OPEN SIDEBAR” button at the top right corner and set the time specifications and the file format of your desired travel data.
   * Time Specification 
     * Time Range
       * You need to specify START DATE and END DATE via either typing or picking dates from the calendar. If the start date is behind the end date, there will be an error alerting.
       * You need to specify START TIME and END TIME via typing.
       * You need to specify DAYS OF WEEK by clicking the checkboxes.
       * You can also import some presets of the above specifications by selecting one from the APPLY PRESET dropdown.
       * If any of the specifications are not completed, there will be an error alerting.
     * Multiple Time Ranges
       * The application supports querying data for multiple time ranges.
       * You can add a new time range by clicking the “ADD NEW TIME RANGE” button.
       * You can replicate an existing time range by clicking the “REPLICATE CURRENT TIME RANGE” button.
       * You can remove a time range by clicking the “REMOVE CURRENT TIME RANGE” button. If you are trying to remove the only time range, there will be an error alerting.
   * File Format specification
     * You can choose the file format(currently supports CSV and XLSX) with different alignments by selecting one from the FILE TYPE dropdown.
   * Get Travel Data File
     * You are ready to go, hit the “GET DISPLAYED LINKS’ DATA” button to get the file.
     * While the application is making your desired file, you cannot request another file.
 
 ## Development requirements
 
 * The project may be deployed on any server running a UNIX-like OS. It requires installation of Python3.6+ and Node.js with pip3 and npm as package managers. The 3rd party libraries are specified in frontend/package.json and backend/requirements.txt.
 * Firstly, run ‘npm install’ in frontend/ and ‘pip3 install -r requirements.txt’ in backend/ to install all the libraries needed.
   * For a development environment, simply run ‘flask run’ in backend/ and ‘npm start’ in frontend/ to start the flask server(on port 5000) and react application (on port 3000).
   * For a production environment, since we use AWS Elasticbeanstalk service for CI/CD, production deployment is automatically included. To build the project, run ‘npm run build’ under frontend/ to build the react application. There are various manual deployment options if not using Elasticbeanstalk. Here we provide an example of manual frontend/backend deployment:
   * Frontend manual deployment (root dir frontend/): ‘pm2 serve <react build folder path> 3000 -spa’ This deploys the  react application on localhost port 3000.
   * Backend manual deployment (root dir backend/): ‘gunicorn -b localhost:5000 -w <# of threads> -5 app:app’ This deploys the flask API server on localhost port 5000.
   * If not using Elasticbeanstalk, you may also want to use a reverse proxy service like Nginx to forward requests to the react’s localhost port to create an entrance of the application.
 * The flask application makes use of system environment variables (os.environ). If certain fields do not exist in the system’s environment variable list, the application will fail to start. For a full list of required system environment variables, check .env file under root directory. This file is by default used when the application is started from the command-line (supported by python-dotenv library). As the project is deployed on an AWS instance through Elasticbeanstalk service, the environment variables are set on the Amazon Elasticbeanstalk management console.

 ## Extra Testing
 
The backend has unit tests powered by pytest for most of the non-database non-API related modules and functions. The tests are located in backend/app/tests. When designing the backend, we followed the single responsibility principle and separated database actions, API interfaces and file actions from logic processing. For example, parse_util.py includes all the parsing logic for error checking incoming request and parsing request body, as well as parsing database query results into proper response formats. This module is thoroughly tested for correctness. There are also tests for validating data structures and testing database connections. These tests can all be run with command ‘pytest’ in the backend folder. During our CI/CD workflow, pytest is also part of the process. If any test case fails, CI/CD will terminate with error.

# Toronto Transportation Traffic Data Filter Web Application / Team Gabriel

## Product Overview
 
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