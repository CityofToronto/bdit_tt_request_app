import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vuc2IiLCJhIjoiY2tnb2E5ODZvMDlwMjJzcWhyamt5dWYwbCJ9.2uVkSjgGczylf1cmXdY9xQ';

class Mapbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: -79.3957,
            lat: 43.6629,
            zoom: 15,
            geojson : {
                type: 'FeatureCollection',
                features: [
                    {
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [-79.3967, 43.6639]
                      },
                      properties: {
                        'marker-color': '#3bb2d0',
                        'marker-size': 'large',
                        'marker-symbol': 'rocket'
                      }
                    },
                    {
                        type: 'Feature',
                        geometry: {
                          type: 'Point',
                          coordinates: [-79.39575, 43.6639]
                        },
                        properties: {
                          'marker-color': '#3bb2d0',
                          'marker-size': 'large',
                          'marker-symbol': 'rocket'
                        }
                    },
                    {
                        type: 'Feature',
                        geometry: {
                          type: 'Point',
                          coordinates: [-79.3957, 43.6649]
                        },
                        properties: {
                          'marker-color': '#3bb2d0',
                          'marker-size': 'large',
                          'marker-symbol': 'rocket'
                        }
                    },
                    {
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [-79.3945, 43.6625]
                      },
                      properties: {
                        'marker-color': '#3bb2d0',
                        'marker-size': 'large',
                        'marker-symbol': 'rocket'
                      }
                    }
                  ]
              },
        };
    }

    componentDidMount() {
        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
        });

        map.on('move', () => {
            this.setState({
                lng: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });
        // The `click` event is an example of a `MapMouseEvent`.
        // Set up an event listener on the map.
        map.on('click', function(e) {
            // The event object (e) contains information like the
            // coordinates of the point on the map that was clicked.
            console.log('A click event has occurred at ' + e.lngLat);
            // let data2 = [ [ -79.39575, 43.6639 ], [ -79.3945, 43.6625 ], [ -79.3957, 43.6649 ], [-79.3967, 43.6639 ] ]
            // for (let i =0; i < data2.length; i++){
            //     console.log(this.state)
            //     let marker = new mapboxgl.Marker()
            //         .setLngLat([data2[i][0], data2[i][1]])
            //         .addTo(map);

            // }

            this.state.geojson.features.forEach(function(marker, i) {

                // create a HTML element for each feature
                var el = document.createElement('div');
                el.className = 'marker';
                el.id = i;
              
                // make a marker for each feature and add to the map
                let createdMarker = new mapboxgl.Marker(el)
                  .setLngLat(marker.geometry.coordinates)
                  .addTo(map);
                  console.log(i)

                  createdMarker.getElement().addEventListener('click', () => {
                    alert("Clicked");
                    
                    createdMarker.getElement().style.backgroundImage = "url(./mLqJkEE2pY.png)"
                });
              });

        }.bind(this));
    }

    render() {
        return (
            <div>
                <div className='sidebarStyle'>
                    <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
                </div>
                <div ref={el => this.mapContainer = el} className='mapContainer'/>
            </div>
        )
    }
}

export default Mapbox;