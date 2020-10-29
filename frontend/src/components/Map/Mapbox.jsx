import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
import { getClosestNode } from '../../actions/actions';
mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vuc2IiLCJhIjoiY2tnb2E5ODZvMDlwMjJzcWhyamt5dWYwbCJ9.2uVkSjgGczylf1cmXdY9xQ';
class Mapbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: -79.3957,
            lat: 43.6629,
            zoom: 15,
            closestNodes:[],
            createdMarkers:[],
            map:'',
            clicked:false,
            remove:false,
            display:false
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
                remove: true,
                display:false
            });
        });
        map.on('click', function (e) {
            if(!this.state.clicked) {
                console.log('A click event has occurred at ' + e.lngLat);
                let coor = {longitude: e.lngLat.lng, latitude: e.lngLat.lat}
                getClosestNode(this, coor)
                this.setState({clicked:true})
            }
            else{
            }
        }.bind(this));
        this.setState({map:map, display:true})
    }

    displayNodes = ()=>{
        const map = this.state.map;
        this.state.closestNodes.forEach(function (marker, i) {
            // create a HTML element for each feature
            let el = document.createElement('div');
            el.className = 'marker';
            let createdMarker = new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinate)
                .addTo(map);
            createdMarker.getElement().addEventListener('click', () => {
                alert("Clicked");
                console.log(createdMarker.getLngLat())
            });
        })

    }
    removeNodes = () => {
        let getMarkers = this.state.map.getContainer().getElementsByClassName('marker');
        for(let i = 0; i < getMarkers.length; i++){
            console.log(getMarkers)
            getMarkers[i].remove();
        }
    }

    render() {
        if(this.state.display){
            this.displayNodes()
        }
        if(this.state.remove){
            this.removeNodes()
        }
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