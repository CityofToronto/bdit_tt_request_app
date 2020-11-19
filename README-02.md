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
 * If a developer were to set this up on their machine or a remote server, what are the technical requirements (e.g. OS, libraries, etc.)?
 * Briefly describe instructions for setting up and running the application (think a true README).
 
 ## Deployment and Github Workflow

Describe your Git / GitHub workflow. Essentially, we want to understand how your team members shares a codebase, avoid conflicts and deploys the application.

 * Be concise, yet precise. For example, "we use pull-requests" is not a precise statement since it leaves too many open questions - Pull-requests from where to where? Who reviews the pull-requests? Who is responsible for merging them? etc.
 * If applicable, specify any naming conventions or standards you decide to adopt.
 * Describe your overall deployment process from writing code to viewing a live applicatioon
 * What deployment tool(s) are you using and how
 * Don't forget to **briefly explain why** you chose this workflow or particular aspects of it!

 ## Licenses 

 Keep this section as brief as possible. You may read this [Github article](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/licensing-a-repository) for a start.

 * What type of license will you apply to your codebase?
 * What affect does it have on the development and use of your codebase?
 * Why did you or your partner make this choice?

