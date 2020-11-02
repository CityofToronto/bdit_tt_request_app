import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
import {getClosestNode, getLinksBetweenNodes} from '../../actions/actions';
import { Button} from 'react-bootstrap'
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
            displayedMarker: [],
            linkData:[],
            links: null,
            buttondisable: false
        };
    };

    componentDidMount() {
        this.createMap()
    };

    createMap(){
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
            this.setState({buttondisable:true})
        });
        this.setState({map: map,clickedNodes: [], displayedMarker: [], linkData:[],});
    }

    resetMap(){
        this.state.map.remove()
        this.createMap()
    }

    getLink() {
        console.log(this.state.linkData)
        this.drawLink(this.state.linkData)
    };

    drawLink(link_data) {
        let links = []
        for(let i = 0; i < link_data.length; i++){
            links = links.concat(link_data[i].geometry.coordinates)
        }
        this.state.map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'MultiLineString',
                    'coordinates': links
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
        let el = document.createElement('div');
        el.className = 'marker';
        el.id = timesClicked.toString();

        const newMarker = new mapboxgl.Marker(el)
            .setLngLat(nodeCandidates[0].geometry.coordinate)
            .addTo(this.state.map);

        if(timesClicked > 0){
            getLinksBetweenNodes(this, {
                fromNodeId: this.state.clickedNodes[timesClicked-1].nodeId,
                toNodeId: nodeCandidates[0].nodeId
            });
        }
        this.setState({
            displayedMarker: this.state.displayedMarker.concat([newMarker]),
            clickedNodes: this.state.clickedNodes.concat([nodeCandidates[0]])
        });
    };

    render() {
        return (
            <div>
                <div className='sidebarStyle'>
                    <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
                </div>
                <div ref={element => this.mapContainer = element} className='mapContainer'/>
                {/* <button className='link-button' disabled={this.state.buttondisable} onClick={() => this.getLink()}>Get Link</button> */}
                <Button variant="outline-primary" className='link-button' disabled={this.state.buttondisable} onClick={() => this.getLink()} size="sm">Get Link</Button>
                <Button variant="outline-primary" className='reset-button' disabled={this.state.buttondisable} onClick={() => this.resetMap()} size="sm">Reset Map</Button>
            </div>
        );
    };
}

export default Mapbox;