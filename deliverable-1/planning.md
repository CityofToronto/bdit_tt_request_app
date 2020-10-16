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

For deploying this project, we plan on using AWS Elasticbeanstalk with CI/CD through GitHub Actions for both frontend and backend.

#### Q5: What are the user stories that make up the MVP?
 * Internal staff
    * As the primary user of this web application, I want to easily and quickly fetch data from the database in order to self-serve my traffic speed data requests.
* Data Scientist 
    * As a potential user of the app, I want to be able to programmatically query the app for traffic information and have it be exported in order to easily analyze it.
 * Third party external consultants
    * As a potential user of the app, I want to also be able to use the app like the internal staff  in order to self-serve my traffic speed data requests.
 * Police 
    * As a potential user of the app, I want to find the less-traffic area so that people are more likely to go overspeed in order to ticket them.
 * Developers 
    * As an admin of the app, I want to have users requests to be standardized in order to be easily processed.

## Process Details

#### Q6: What are the roles & responsibilities on the team?

The different roles that we will need are the backend role and frontend role. The backend is broken into the api  and the processing role. The processing role will be responsible for parsing user requests and querying the database for the responses, and the api role will be responsible for the api’s handling information exchanging between the front and back end. The frontend role is broken into the design and overlay role, and the functionality role. The design and overlay role is responsible for displaying information on the screen in an understandable way and updating the display whenever new information is provided, and the functionality role is responsible for getting information from the user and turning it into data which can be processed by the backend.

* Kenneth: Front end time-input data and overall UI design. Strengths fit for this role include experience with React (Has taken CSC309) and has worked with map related applications. Some Weaknesses associated with this role are: no experience with Mapbox and first time working on an industry project. Further responsibilities include planning meetings among the group members and facilitating discussions.  
* Qiwen: Front end map and overlay design. Strength includes experience with React (Has taken CSC309) and has worked with map related applications. Weakness includes no previous experience with Mapbox, slow learner to catch up new things,  insufficient time to work due to heavy workload, no previous experience working on an industry project. Further responsibilities include the communication between the team and the partner.
* Daniel: Frontend map functionality, creates the functional components of the front end. Strengths: Have experience working with react from assignment 1, Have experience with data processing, Have experience with using Jest for frontend functionality testing. Weaknesses: Unfamiliarity with Mapbox, No experience with graphic design, No experience working on large scale projects.
* Adrian: Main backend designer. Familiar with Python Flask(appointed by project partner) and SQLAlchemy(for parsing SQL database objects) , experiences with designing API servers. Unfamiliar with graphical designs, no experience with map-related applications, never used mapbox or postgre database.
* Lee: Frontend data functionality, data transaction with backend. Strengths: 1. Experience in ReactJS  2. Experience with frontend data handling 3. Experience in medium scale web projects. Weakness: 1. No exposure to Mapbox or other map apis 2. Poor taste in graphical design 3. Need to work under supervision or towards deadline


#### Q7: What operational events will you have as a team?

Every Friday 15:00 - 16:00 the team will have a meeting together with Raphael Dumas (partner from Toronto Big Data Innovation Team) to talk about the progress and difficulties of the project on the City of Toronto Web Conferencing platform online. <br/><br/>
For regular coding meetings, we decided to make it ad-hoc, so that whenever one or more team member(s) encounter problems, the team has completed a milestone or that the team members would schedule a meeting ASAP to address that problem. These meetings can be either through asynchronous chattings online with available members at the time, or a group meeting on the discord voice channel we established. Team meetings: <br/> <br/>
* The team members had a meeting on October 10th 13:00 - 14:00 to discuss the Deliverable 1 and our next steps, since the prototype of the mock datasets was provided by Raphel on the previous day (October 9th). The team went through the Deliverable 1 planning.md file and filled the document according to our current plans. <br/><br/>

We had one meeting with our project partner Raphael (with explanation why we had only 1):
* We had a meeting on October 7th with Raphel on City of Toronto Web Conferencing from 14:30 - 15:30. We discussed the purpose and fundamentals of the project. Raphael briefed us with the tech stacks the platform is currently using (Postgre db and pgRouting deployed on Amazon private cloud managed by the City of Toronto) and suggested us to use Python flask as our backend server to parse data from the databases and send them to the website. He described the purpose and several potential user cases of the project. Since we would not be given access to the full stack on the City of Toronto private cloud, Raphael agreed to provide us with mocked datasets and database structures on a Github repository as soon as he completed them. We asked many questions about details in frontend design, goals of the project and the access we have to the databases. This meeting also established our regular meeting with Raphael on every Friday 15:00 - 16:00.
* After our first meeting on October 7th, Raphael stated that his team still needs some time to work on the backend data aggregation function after he provided us with the mock datasets on October 9th. Since we have not yet been provided with the full backend functions, we did not have sufficient information to make enough progress for another meeting before the due date of deliverable 1.
  
#### Q8: What artifacts will you use to self-organize?

We are planning to use Github repository’s Issues to organize and track tasks.

The team will set up milestones at the beginning of each stage of the development. At this point, the milestone will contain a list of CHECKPOINTs for both frontend and backend that describes each design component from an abstract scale. According to the specifics of each CHECKPOINT, it will be assigned to one or more individuals that are responsible for it. Once a CHECKPOINT is considered to be completed, every member assigned to that CHECKPOINT needs to cross-check, perform thorough testing and comment below the CHECKPOINT before closing the CHECKPOINT to mark it done.

When encountering a bug, making improvement suggestions, suggesting new features or wanting clarifications on certain components, an issue must be created with proper labels and assigned to proper individuals. Bugs should be pinned at the top of all issues, since bug fixing is the top priority of all tasks. The individual(s) who are assigned to each task are responsible for solving, testing and closing them. 

When resolving one or more issues, a branch should be created specifically for solving them. All pull requests from any branch must be properly labelled and linked to their associated issues (whether they are CHECKPOINT, bug, features, etc.) and assigned to all individuals affiliated with the issues. The pull requests should be reviewed by everyone assigned and then properly merged. Meetings should be set-up as needed when there is a pending pull request.

A pull request to master branch should only be created when a milestone is completed. A team meeting with all members present is expected, as a merge to main signifies a release.

#### Q9: What are the rules regarding how your team works?

**Communications:**

We expect all members to be up to date daily and check both in the morning and night for messages in our group chat.

Each person will be responsible for checking messages and the github issue pages for work they need to complete. Reminders will be facilitated by all group members to confirm that every member is making progress. 

**Meetings:**

We will be using both facebook messenger and discord voice calls to communicate with each other during meetups and throughout the project.

To communicate with our project partner, we are using cisco meetings. He will send our group a weekly link and a meeting will be held every friday to discuss issues and new developments.

**Conflict Resolution:**

* A team member is not meeting their deadlines
    * First we will determine the cause of this issue (incompetence, workload, other preoccupations). Then all members will come together to discuss and plan solutions for the issue depending on the first step. For example if the member in question just has too many tasks for them to handle, we will try to spread some of their tasks to all members. If incompetence becomes an issue, we will tell the TA about it.  
* One person makes decisions on behalf of everyone without much consultation
    * Talk to that person and ask them not to start working until the rest of the teammates agree on the decision. After this, we would need to have a meetup to reorganize responsibilities. 
    * For conflicts involving two members on a decision, a small debate will be held where both sides will discuss the benefits of their implementation and a democratic vote by the 3 remaining members will determine which path will be taken.
* Your team cannot agree on any major decisions
    * For conflicts involving two members on a decision, a small debate will be held where both sides will discuss the benefits of their implementation and a democratic vote by the 3 remaining members will determine which path will be taken.


----
### Highlights
 
* Decision: Work division; A lot more people working on the front end than the backend, 4 to 1 split.
    * Alternative 1: 3 to 2 split
    * Reason: we have determined that this project focuses heavily on the front end UI 
* Decision: We decided on using mapbox for the implementation of our map.
    * Alternative 1: React Google Map API
    * Alternative 2: Google Map React API
    * Reason: The partner picked mapbox
* Decision: We decided on using GitHub Issues to assign and track tasks to members.
    * Alternative 1: Asana, which provides a fancy tracking table for tasks
    * Alternative 2: Trello, which is used by some members before
    * Reason: GitHub Issues also provides rich text contents for each issue, and is convenient to access since it’s in the same repository

