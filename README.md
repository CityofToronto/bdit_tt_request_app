# Travel Time Request App
This is a simple web app designed to eventually help City staff self-serve their data needs for averaged travel time data, which we usually source from [HERE](https://github.com/CityofToronto/bdit_data-sources/tree/master/here). Currently these needs are handled through a more time-consuming data request process. 

This app was originally developed as a [class project by U of T students](https://www.youtube.com/watch?v=y6lnefduogo) in partnership with the City. It is currently deployed inside the City ntwork at [https://10.160.2.198/traveltime-request/](https://10.160.2.198/traveltime-request/).

For information on app development and deployment, see [development](./development/).

## How to create segments
Currently only the segment creation piece is ready to use, segments can be drawn following the steps below:

1. To draw a segment, you will need to place at least two nodes on the map which represents the start and end point of the segment. Each node can be placed by clicking on their desired location on the map. The order of placing each node is important as it dictates the direction of how the segment will be drawn. 
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
 