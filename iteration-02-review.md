# Toronto Transportation Traffic Data Filter Web Application  
# Team Gabriel (Team 22)
 
## Iteration 1 - Review & Retrospect

 * When:  Nov 19, 2020
 * Where: ONLINE THROUGH DISCORD

## Process - Reflection

#### Q1. Decisions that turned out well

 * Decision 1: Using github projects to organize our tasks.
 
   We decided early on to use github projects as a kanban style organization tool to divide work and clearly document our progress during this project.  We successfully created checkpoints and milestones that we stuck to and it resulted in a smooth progression of work. 
   
 * Decision 2: Using messenger and discord as platforms of communication.
 
   To communicate through this project we used a group chat in messenger and a discord server. At no point in this project did members fail to communicate with each other and everyone was up to date on current events and tasks at hand. For discussing meeting feedback or reporting progresses, communications via messenger went fast and efficiently. When there was a need to merge different branches, discord provided us a convenient way to show and tell. 

 * Decision 3: Using JetBrains PyCharm and WebStorm ‘s integrated code & file formatting
 
	  To make our coding style coherent, we decided to use JetBrains PyCharm and WebStorm as our standard working IDEs. Also, to make our codes coherent and visually better, we decided to use the integrated code & file formatting tool inside the IDEs. This decision turned out well as we didn't encounter any problems or inconvenience caused by different coding styles. 


#### Q2. Decisions that did not turn out as well as we hoped

 * Decision 1: Mapbox markers rather than geojson markers to display nodes on the map
 
   The use of mapbox markers proved difficult as many of the resources we found explained solutions using mapbox geojson markers. We had integrated mapbox markers heavily in our implementation so it was in our best interest to not switch. This forced us to find alternatives to problems which took a sizable amount of time. Although the final product deployed implements many of the things we envisioned, at multiple times we had to change our desired implementation due to restriction of the tools we used at the beginning. Had we done further research at the beginning, the implementation of some features (such as displaying numbered and colored nodes) would have been significantly easier. 
   
 * Decision 2:  Using css to manage the positioning of components on the sidebar
 
	  The use of css to control the position of components on the sidebar made it so that, while the components looked properly positioned on the monitor of the person making the changes, when viewed from another monitor, or when the vertical size of the window was changed, the position of the components and their relative locations would vary wildly, even merging into each other. In the end we had to scrap this decision and use React form control to manage the components, all their labels and their positioning on screen.

#### Q3. Planned changes

Our workflow for this phase of the project was relatively smooth and there were no major bumps that we encountered. We will continue to work as we have been for the next deliverables. 

## Product - Review

#### Q4. How was your product demo?

 * Prior to the meeting we pretested every functionality in advance to make sure that everything works as expected. We regularly test the app before each weekly meeting and always present a functional project to the partner. 

 * During the meeting, we showed our partner all the features that we have currently deployed, and the partner later used the testing link to explore the app themselves. We explained to our partner in detail the technical implementation of the app, the problems we encountered along the way and our solutions to the problems. 

 * We believe that our partner accepted the features as they are impressed by our app, and didn’t complain or negatively commented about any features. Our partner said “wow, I am quite impressed.”  : )

 * Our partner did not propose any changes, they said they would compile a document with comments from their team and send it to us some time during D3. 

 * What we learned during this deliverable: 
   * We learned the importance of having a good workflow and its wider impact on the health of a project.
   * We also learned that examining and considering edge cases prior to our development is very important, or we may encounter problems down the line. 
