import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
import {getClosestNode, getLinksBetweenNodes} from '../../actions/actions';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vuc2IiLCJhIjoiY2tnb2E5ODZvMDlwMjJzcWhyamt5dWYwbCJ9.2uVkSjgGczylf1cmXdY9xQ';

class Mapbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: -79.3957,
            lat: 43.6629,
            zoom: 15,
            closestNodes: {},
            createdMarkers: [],
            map: '',
            clicked: 0,
            firstClickedNode: null,
            secondClickedNode: null,
            clickOnMap: false,
            display: false,
            links: null
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
                zoom: map.getZoom().toFixed(2),
                display: false

            });
        });
        map.on('click', function (e) {
            console.log('A click event has occurred at ' + e.lngLat);
            let coor = {longitude: e.lngLat.lng, latitude: e.lngLat.lat}
            getClosestNode(this, coor)
            this.setState({clickOnMap: true})
        }.bind(this));
        this.setState({map: map, display: true})
    }

    getLink() {
        getLinksBetweenNodes(this, {
            fromNodeId: this.state.firstClickedNode.nodeId,
            toNodeId: this.state.secondClickedNode.nodeId
        })
    }
    drawLink() {
        if (this.state.clicked === 3 && this.state.links) {
            const map = this.state.map;

            map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'MultiLineString',
                        'coordinates': this.state.links.geometry.coordinates
                    }
                }
            });
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 8
                }
            });
            this.setState({map: map, clicked: this.state.clicked + 1})
        }
    }

    displayNodes() {
        const map = this.state.map;
        if (this.state.closestNodes.length > 0 && this.state.clicked === 0 && this.state.clickOnMap) {
            let el = document.createElement('div');
            el.className = 'marker';
            el.id = 0;
            let createdMarker = new mapboxgl.Marker(el)
                .setLngLat(this.state.closestNodes[0].geometry.coordinate)
                .addTo(map);
            this.setState({
                firstClickedNode: this.state.closestNodes[0],
                clicked: this.state.clicked + 1,
                clickOnMap: false
            })
            this.setState({closestNodes: {}})
        } else if (this.state.closestNodes.length > 0 && this.state.clicked === 1 && this.state.clickOnMap) {
            let el = document.createElement('div');
            el.className = 'marker';
            el.id = 0;
            new mapboxgl.Marker(el)
                .setLngLat(this.state.closestNodes[0].geometry.coordinate)
                .addTo(map);
            this.setState({
                secondClickedNode: this.state.closestNodes[0],
                clicked: this.state.clicked + 1,
                clickOnMap: false
            })
            this.setState({closestNodes: {}})
        }
        if (this.state.firstClickedNode && this.state.secondClickedNode && this.state.clicked === 2) {
            this.getLink()
            this.setState({clicked: this.state.clicked + 1})
        }
    }

    render() {
        this.displayNodes()
        return (
            <div>
                <div className='sidebarStyle'>
                    <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
                </div>
                <div ref={el => this.mapContainer = el} className='mapContainer'/>
                <button className='link-button' onClick={() => this.drawLink()}>Get Link</button>
            </div>
        )
    }
}

export default Mapbox;