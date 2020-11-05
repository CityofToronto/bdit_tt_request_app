import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
import {getClosestNode, getLinksBetweenNodes, getTravelDataFile, updateClosestNode} from '../../actions/actions';
import {Button} from 'react-bootstrap'

mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vuc2IiLCJhIjoiY2tnb2E5ODZvMDlwMjJzcWhyamt5dWYwbCJ9.2uVkSjgGczylf1cmXdY9xQ';


class Mapbox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lng: -79.3957,
            lat: 43.6629,
            zoom: 15,
            map: '',
            linksData: [],
            clickedNodes: [],
            displayedMarker: [],
            disableRemove: true,
            disableGetLink: true,
            disableReset: true,
            disableAddMarker: false,
            disableDragMarker: true
        };
    };

    componentDidMount() {
        this.createMap()
    };

    createMap() {
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
            if (!this.state.disableAddMarker) {
                // console.log('A click event has occurred at ' + e.lngLat);
                if (this.state.clickedNodes.length >= 10){
                    alert("Currently only allow maximum 10 nodes on the map!");
                } else {
                    this.disableInteractions();
                    getClosestNode(this, {longitude: e.lngLat.lng, latitude: e.lngLat.lat}); 
                }
            }

        });
        this.setState({
            map: map,
            clickedNodes: [],
            travelDataFile: [],
            displayedMarker: [],
            linksData: [],
            disableAddMarker: false,
            disableRemove: true,
            disableGetLink: true,
            disableReset: false,
            disableDragMarker: false
        });
    }

    resetMap() {
        this.state.map.remove()
        this.createMap()
    };

    addTravelDataFiles(linkDataArr) {
        let allLinkDirs = [];
        linkDataArr.forEach((link) => {
            allLinkDirs = allLinkDirs.concat(link.link_dirs)
        });

        getTravelDataFile(this, {
            startTime: "2018-09-02 00:00:00",
            endTime: "2018-09-03 23:00:00",
            linkDirs: allLinkDirs,
            fileType: "csv"
        });
    };

    disableInteractions() {
        this.setState({
            disableGetLink: true,
            disableRemove: true,
            disableAddMarker: true,
            disableReset: true,
            disableDragMarker: true
        });
        this.forceUpdate();
    }

    getLink() {
        console.log(this.state.clickedNodes);
        this.disableInteractions();
        getLinksBetweenNodes(this);
    };

    /* this function is called only by action.js after full link data is fetch */
    displayLinks(linkDataArr) {
        this.drawLinks(linkDataArr);

        /* comment this if does not want to disable dragging after get link */
        const lockedMarkers = [...this.state.displayedMarker]
        lockedMarkers.forEach((marker) => {
            marker.setDraggable(false);
        });

        this.setState({
            linksData: linkDataArr,
            disableReset: false,
            displayedMarker: lockedMarkers
        }, () => {this.addTravelDataFiles(linkDataArr)});
    };

    drawLinks(linkDataArr) {
        linkDataArr.forEach((link) => {
            const currSourceId = `route${link.source}${link.target}`
            this.state.map.addSource(currSourceId, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'MultiLineString',
                        'coordinates': link.geometry.coordinates
                    }
                }
            });
            this.state.map.addLayer({
                'id': currSourceId,
                'type': 'line',
                'source': currSourceId,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 8
                }
            });
        });
    };

    onDragEnd(marker) {
        if (this.state.disableDragMarker) {
            const restoreMarkers = [...this.state.displayedMarker]

            for (let i = 0; i < restoreMarkers.length; i++){
                let currMarker = restoreMarkers[i];
                let currNode = this.state.clickedNodes[i];

                const restoreCoordinate = {lat: currNode.geometry.coordinate[1], lng: currNode.geometry.coordinate[0]};
                currMarker.setLngLat(restoreCoordinate);
            }
            this.setState({displayedMarker: restoreMarkers});

        } else {
            this.disableInteractions();

            let lngLat = marker.getLngLat();
            const nodeId = parseInt(marker._element.id);
            updateClosestNode(this, {
                longitude: lngLat.lng,
                latitude: lngLat.lat,
                nodeId: nodeId
            });
        }
    }

    /* this function is called only by action.js after a marker drag */
    updateMarker(nodeId, nodeCandidates) {
        const newNode = nodeCandidates[0];

        const newMarkers = [...this.state.displayedMarker];
        const draggedMarker = newMarkers[nodeId];
        const newCoordinate = {lat: newNode.geometry.coordinate[1], lng: newNode.geometry.coordinate[0]};
        draggedMarker.setLngLat(newCoordinate);

        const newNodes = [...this.state.clickedNodes];
        newNodes[nodeId] = newNode
        this.setState({
            displayedMarker: newMarkers,
            clickedNodes: newNodes,
            disableAddMarker: false,
            disableRemove: false,
            disableGetLink: this.state.clickedNodes.length < 2,
            disableReset: false,
            disableDragMarker: false
        });
    }

    /* this function is called only by action.js after adding a new marker */
    addNodeToMapDisplay(nodeCandidates) {
        const newNode = nodeCandidates[0];
        let el = document.createElement('div');
        el.className = `marker${this.state.clickedNodes.length + 1}`;
        el.id = this.state.clickedNodes.length.toString();

        const newMarker = new mapboxgl.Marker(el, {draggable: true})
            .setLngLat(newNode.geometry.coordinate)
            .addTo(this.state.map);

        newMarker.on('dragend', this.onDragEnd.bind(this, newMarker));

        this.setState({
            displayedMarker: this.state.displayedMarker.concat([newMarker]),
            clickedNodes: this.state.clickedNodes.concat([newNode]),
            disableAddMarker: false,
            disableRemove: false,
            disableGetLink: this.state.clickedNodes.length < 1,
            disableReset: false,
            disableDragMarker: false
        });
    };

    removeNodes() {
        let lastNodeNum = this.state.clickedNodes.length - 1;
        let getMarkers = document.getElementById(lastNodeNum.toString());
        getMarkers.remove();
        let newDisplayedMarker = [...this.state.displayedMarker];
        newDisplayedMarker.splice(lastNodeNum, 1);

        let newClickedNode = [...this.state.clickedNodes];
        newClickedNode.splice(lastNodeNum, 1);

        this.setState({
            clickedNodes: newClickedNode, displayedMarker: newDisplayedMarker,
            disableGetLink: lastNodeNum <= 1, disableRemove: lastNodeNum <= 0
        });
    }

    render() {
        return (
            <div>
                <div className='sidebarStyle'>
                    <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
                </div>
                <div ref={element => this.mapContainer = element} className='mapContainer'/>
                <Button variant="outline-primary" className='remove-button' disabled={this.state.disableRemove}
                        onClick={() => this.removeNodes()} size="sm">Remove Node</Button>

                <Button variant="outline-primary" className='link-button' disabled={this.state.disableGetLink}
                        onClick={() => this.getLink()} size="sm">Get Link</Button>
                <Button variant="outline-primary" className='reset-button' disabled={this.state.disableReset}
                        onClick={() => this.resetMap()} size="sm">Reset Map</Button>
            </div>
        );
    };

}

export default Mapbox;