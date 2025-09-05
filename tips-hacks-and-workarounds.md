# Tips, Hacks, & Workarounds

We do not have the resources at this time to provide a nice, intuitive UI for all the features of the Travel Time App. Often we'll extend its functionally with a quick hack or undocumented/undisclosed feature.

## Do I really have to draw all these corridors again?

App crashed? Need to review or check someone else's results from the App?

If you've saved the output from a previous use of the app, then you have everything you need to recreate the whole request verbatim. This could be either a GeoJSON of the corridors of the CSV or JSON of the travel times.

1. Open up the folder where you have that file saved
2. Start a fresh version of the app (refresh your browser or open the page)
3. Drag the file from the folder onto the side panel of the App and drop it.

(You may need to drop the file in the top portion of the side panel)

The app will restore it's previous state by parsing the `URI` field(s) from the previously saved outputs. 

## Help! The intersection I want to select isn't selectable!

This hack makes use of the one described above. The App only lets the user select from a limited list of intersections (for now). But sometimes we need other ones too!

