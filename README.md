# Toronto Transportation Traffic Data Filter Web Application  
# Team Gabriel (Team 22) 

## Description 

 * **Context**:  The toronto big data innovation team handles data requests from a wide variety of clients including academia and industry. These data requests are about traffic travel times across the city of toronto. They collect and store data of roads all across Toronto and the expected travel times on the roads at any time of day, at any time of the year.
 
 * **Problem**:  Queries from these clients are often not specific and not in the proper format, this causes the team to spend a lot of time formatting the queries into something usable. They needed a visual and user-friendly web-application in order to standardize the process to make queries so that users can easily self-serve the travel time data on the city of toronto without needing the team to intervene.
 
 * **Description of Application**: This web-application purpose is to streamline the way users can fetch data from the toronto big data innovation team’s database. Using a map, users can create sequences of nodes in order to designate paths on which to query the data. The user can then use the sidebar to choose specific times during a day, across a period in the year to receive a data file (csv, xmlx) as output. This gives users the ability to shape their desired query through a visual system which is intuitive and fast. This also removes the need for the big data innovation team to intervene with queries as everything can be done by the user.

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

 * Access to the Application
   * To access the application, please visit http://frontendproduction-env.eba-4ef5jwdw.ca-central-1.elasticbeanstalk.com/
   * Since this application is developed as a prototype of an internal tool for the Toronto Transportation Services Big Data Innovation team, there is no user authentication requirement at the current development stage. All users having access to the application are granted the same and complete access to features and functionalities.
   * On a successful access to the application, you should be able to see: 
     * A sidebar at the left side of the web page. By clicking on other parts of the web page, the sidebar should collapse.
     * A group of 6 buttons (the top one with a text field) at the bottom right corner of the web page.
     * A top bar with geometrical information and current sequence number displayed on the left and a button on the right. By clicking the button, the left sidebar mentioned previously should expand.
     * A map interface basically like all popular map tools, which allows you to zoom, drag, and scroll, etc...
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
 * Server
   * By any chance if you want to test our API server, the link is given below http://backendproduction-env.eba-5qbcpngm.ca-central-1.elasticbeanstalk.com/ 
   * To test our APIs, please refer to the application’s API document in https://github.com/Accelsnow/team-project-22-toronto-big-data-innovation-team/tree/dev/doc
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
 
 ## Deployment and Github Workflow
 
 * Codebase management:
We use Github repository to manage our codebase.

 * Avoid conflicts:
We have set up a Github Project using Kanban style DevOps on our Github repository. At the end of every weekly partner meeting, our group holds a meeting to talk about our goals and features to implement for the next week. Each feature and task is made into a Github Issue marked with proper labels. The issue will appear in the Project page as a card in the To Do section. Whenever one decides to work on the project, he/she will first drag the card representing the feature he/she is implementing into the In Progress column to notice everyone that this feature is under development. We also make lots of active communication on both our Discord server and messenger group to keep everybody up-to-date about the implementation progress. The cards will be automatically moved to completed once the pull request or issue it is associated with is marked closed. We have only had one major conflict, and the group members involved in the conflict realized and acknowledged the conflicts ahead of time and arranged a short meeting to resolve all the conflicts together and did thorough testing afterwards.
A team member notifies the group in the messenger chat before creating a pull request to the dev branch (our main branch). If the feature does not cross boundaries (i.e. the PR requires no support from other people’s features/code), the member can merge the pull request once the Github Action workflow completed successfully and the test server shows no error in functionalities. If it involves changing existing code of others, the owner of the affected code should be notified about the change. Once that person acknowledges the changes and approves its validity, the PR can then be merged.

 * Conventions:
All team members use the same IDEs (Pycharm for backend flask server and WebStorm for frontend Node.js). The code formatting and code style check tool helps with unified code style. For naming conventions, the frontend Node.js follows the camelcase naming convention and the backend python follows the underscore naming convention, as suggested by the language documents.

 * Code to live view:
As described above in the development requirements section, each team member can run both the frontend and backend on localhost on their own machine to test functionalities locally. PyCharm and WebStorm also provide support for running the applications in debug mode.

 * Deployment:
The team uses Github Action as our CI/CD workflow tool. The github workflow files were created at the beginning during the initial project set up phase. Each workflow tests, builds and deploys the current codebase (frontend deployment and backend deployment are seperated). We currently have 4 different servers, frontend test server, frontend production server, backend test server and backend production server. The production servers are stable versions of the project that only get updated for each major release. The test server is updated every time a pull request is created. With Github’s workflow trigger, as a pull request to the dev branch is created, the workflow will be automatically triggered, executing all the unit tests available and deploying the build version of the current codebase to the test server. Besides, the workflow also triggers when a pull request is successfully merged into the dev branch, deploying the current version of dev to the test server.
All servers are hosted by Amazon AWS service. The build versions of our codebase are uploaded to amazon S3 storage first with a unique commit-hash, then automatically deployed to the server instance using Elasticbeanstalk service.
We decided to use this workflow since two of the team members have experiences using it for the Assignment 1, and thus are familiar with how to set it up. It also requires no extra support and is embedded inside Github with clear indication beside each commit and pull request whether the workflow succeeded or failed. The automatic triggering upon PR also makes it easy for testing purposes.

 ## Licenses 
 
Since our partner wants the code to be private, we made our Github repository private and did not assign a license for it. This hides our repository from the public; only people with access may access our project’s codebase. Once we finish this project, our project partner (Toronto Big Data Innovation Team) will take our codebase and internalize it into the City of Toronto’s private AWS Cloud.
