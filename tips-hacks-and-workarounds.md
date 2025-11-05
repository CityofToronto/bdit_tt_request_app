# Tips, Hacks, & Workarounds

We do not have the resources at this time to provide a nice, intuitive UI for all the features of the Travel Time App. Often we'll extend its functionally with a quick hack or undocumented/undisclosed feature.

## I'm clicking the map, but the intersection I want isn't selected

Not all intersections are available to select from the map at this time.
To see which ones _are_ selectable, double-click on the map and a selection of available nearby intersections will be displayed briefly.

## Do I really have to draw all these corridors again?

App crashed? Need to review or check someone else's results from the App?

If you've saved the output from a previous use of the app, then you have everything you need to recreate the whole request verbatim. This could be either a GeoJSON of the corridors or the CSV or JSON of the travel times.

1. Open up the folder where you have that file saved
2. Start a fresh version of the app (refresh your browser or open the page)
3. Drag the file from the folder onto the side panel of the App and drop it.

(You may need to drop the file in the top portion of the side panel)

The app will restore it's previous state by parsing the `URI` field(s) from the previously saved outputs. Or really, it will parse the file you dropped in as a general text file and search it for patterns matching the URI field. All combinations of the various selectable fields will be recreated in the App.

If the URI it finds is a corridor URI like `https://trans-bdit.intra.prod-toronto.ca/tt-request-backend/link-nodes/here/30415282/30415237` then just a corridor will be added.

If it's a full travel time URI like `https://trans-bdit.intra.prod-toronto.ca/tt-request-backend/aggregate-travel-times/30415282/30415237/12/15/2025-09-01/2025-09-03/true/1234567` then all of those query parameters (corridor + dates + times + days-of-week + holidays) will be added.

## Help! The intersection I need to select isn't selectable!

This hack makes use of the one described above. 

The App only lets the user select from a limited list of intersections (for now). But sometimes we need other ones too!

What the app is actually doing is just routing between nodes in the Here network identified by a `node_id`. If you can supply it with the `node_id` of a different intersection it won't know that it's one of the ones you couldn't select. 

You can find Here `node_id`s in the `bigdata` database in the view `here.routing_nodes_24_4` (or whatever the latest numbered version is). I like to just put these on a map in QGIS over some basemap to find the ones I want.

The `node_id`s for a corridor are the first two integers in the `URI` field, in the order `from/to`.  

So let's say you've drawn a corridor with a URI like 
`https://trans-bdit.intra.prod-toronto.ca/tt-request-backend/aggregate-travel-times/30415282/30415237/12/15/2025-09-01/2025-09-03/true/1234567`.

`30415282/30415237` are your from/to `node_id`s. If you actually want this corridor to end at `node_id` `123` though, then the `URI` representing the correct corridor is 
`https://trans-bdit.intra.prod-toronto.ca/tt-request-backend/aggregate-travel-times/30415282/123/12/15/2025-09-01/2025-09-03/true/1234567`.

If you can put this URI in a text file (like a CSV, etc) and drag it into the app (see above), the app will add the custom corridor automatically.
