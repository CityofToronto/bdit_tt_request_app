# Toronto Transportation Traffic Data Filter Web Application  
# Team Gabriel (Team 22)
 
## Description 
 * **Context**: The toronto big data innovation team handles data requests from a wide variety of clients including academia and industry. These data requests are about traffic travel times across the city of toronto. They collect and store data of roads all across Toronto and the expected travel times on the roads at any time of day, at any time of the year.
 
 * **Problem**: Queries from these clients are often not specific and not in the proper format, this causes the team to spend a lot of time formatting the queries into something usable. They needed a visual and user-friendly web-application in order to standardize the process to make queries so that users can easily self-serve the travel time data on the city of toronto without needing the team to intervene.
 
 * **Description** of Application: This web-application purpose is to streamline the way users can fetch data from the toronto big data innovation team’s database. Using a map, users can create sequences of nodes in order to designate paths on which to query the data. The user can then use the sidebar to choose specific times during a day, across a period in the year to receive a data file (csv, xmlx) as output. This gives users the ability to shape their desired query through a visual system which is intuitive and fast. This also removes the need for the big data innovation team to intervene with queries as everything can be done by the user.

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
 * Clear instructions for how to use the application from the end-user's perspective
 * How do you access it? Are accounts pre-created or does a user register? Where do you start? etc. 
 * Provide clear steps for using each feature described above
 * This section is critical to testing your application and must be done carefully and thoughtfully
 
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
