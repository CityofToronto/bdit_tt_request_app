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
            map: '',
            clickedNodes: [],
            links: null
        };
    };

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
        map.on('click', (e) => {
            console.log('A click event has occurred at ' + e.lngLat);
            getClosestNode(this, {longitude: e.lngLat.lng, latitude: e.lngLat.lat});
        });

        this.setState({map: map});
    };

    getLink() {
        getLinksBetweenNodes(this, {
            fromNodeId: this.state.clickedNodes[0].nodeId,
            toNodeId: this.state.clickedNodes[1].nodeId
        });
    };

    drawLink(link_data) {
        this.state.map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'MultiLineString',
                    'coordinates': link_data.geometry.coordinates
                }
            }
        });
        this.state.map.addLayer({
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
    };

    addNodeToMapDisplay(nodeCandidates) {
        const timesClicked = this.state.clickedNodes.length;

        if (timesClicked <= 1) {
            let el = document.createElement('div');
            el.className = 'marker';
            el.id = timesClicked.toString();

            new mapboxgl.Marker(el)
                .setLngLat(nodeCandidates[0].geometry.coordinate)
                .addTo(this.state.map);

            this.setState({
                clickedNodes: this.state.clickedNodes.concat([nodeCandidates[0]])
            });
        }
    };

    render() {
        return (
            <div>
                <div className='sidebarStyle'>
                    <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
                </div>
                <div ref={element => this.mapContainer = element} className='mapContainer'/>
                <button className='link-button' onClick={() => this.getLink()}>Get Link</button>
            </div>
        );
    };
}

export default Mapbox;