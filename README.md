# Travel Time Requet App
University of Toronto CSC301 Team Project - Toronto Big Data Innovation Team

AWS CI/CD URLs:
  - [backend production server](http://backendproduction-env.eba-5qbcpngm.ca-central-1.elasticbeanstalk.com/)
  - [backend test server](http://backendtest-env.eba-aje3qmym.ca-central-1.elasticbeanstalk.com/)
  - [frontend production server](http://frontendproduction-env.eba-4ef5jwdw.ca-central-1.elasticbeanstalk.com/)
  - [frontend test server](http://frontendtest-env.eba-wempu9ue.ca-central-1.elasticbeanstalk.com/)

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
