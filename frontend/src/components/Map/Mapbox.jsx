import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
import {getClosestNode, updateClosestNode} from '../../actions/actions';
import {Button, Form} from 'react-bootstrap';
import arrowImage from '../Images/arrow.png';
import doubleArrowImage from '../Images/doublearrow.png';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vuc2IiLCJhIjoiY2tnb2E5ODZvMDlwMjJzcWhyamt5dWYwbCJ9.2uVkSjgGczylf1cmXdY9xQ';


class Mapbox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lng: -79.3957,
            lat: 43.6629,
            zoom: 15,
            map: '',
            displayedLinkSources: [],
            clickedNodes: [[]],
            displayedMarker: [[]],
            currentSequence: 0,
            sequenceColours: [this.getRandomColor()],
            disableNodeRemove: true,
            disableGetLink: true,
            disableReset: true,
            disableAddMarker: false,
            disableDragMarker: true,
            disableNewSeq: true,
            selectedSeq: "",
            linksData: [],
            disableLinkRemove: false
        };
    };

    componentDidMount() {
        this.createMap();
    };

    createMap() {
        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom,
            attributionControl: false
        });
        map.addControl(new mapboxgl.AttributionControl(), 'top-right');
        map.on('load', () => {
            map.loadImage(
                arrowImage,
                function (error, image) {
                    if (error) throw error;
                    map.addImage('arrow-line', image);
                })
            map.loadImage(
                doubleArrowImage,
                function (error, image) {
                    if (error) throw error;
                    map.addImage('double-arrow-line', image);
                })
        })
        map.on('move', () => {
            this.setState({
                lng: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2),
            });
        });
        map.on('click', (e) => {
            if (!this.state.disableAddMarker) {
                if (this.state.clickedNodes[this.state.currentSequence].length >= 10) {
                    alert("Currently only allow maximum 10 nodes on the map!");
                } else {
                    this.disableInteractions();
                    getClosestNode(this, {longitude: e.lngLat.lng, latitude: e.lngLat.lat});
                }
            }

        });
        this.setState({
            map: map,
            clickedNodes: [[]],
            displayedMarker: [[]],
            linksData: [],
            displayedLinkSources: [],
            sequenceColours: [this.getRandomColor()],
            disableAddMarker: false,
            disableNodeRemove: true,
            disableGetLink: true,
            disableLinkRemove: false,
            disableReset: false,
            disableDragMarker: false,
            disableNewSeq: true,
            currentSequence: 0,
            selectedSeq: ""
        });
    }

    resetMap() {
        this.state.map.remove();
        this.createMap();
        this.props.resetMapVars();
    };

    disableInteractions() {
        this.setState({
            disableGetLink: true,
            disableNodeRemove: true,
            disableAddMarker: true,
            disableReset: true,
            disableDragMarker: true,
            disableNewSeq: true,
            disableLinkRemove: true
        });
        this.forceUpdate();
    }

    getLink() {
        this.disableInteractions();
        this.removeAllLinkSources();
        this.props.getLinks(this);
    };

    /* this function is called only by action.js after full link data is fetch */
    displayLinks(linkDataArr, sequence) {
        this.drawLinks(linkDataArr, sequence);
        // This is where links are set
        this.setState({
            linksData: this.state.linksData.concat([linkDataArr]),
            disableReset: false,
            disableGetLink: false,
            disableNodeRemove: false,
            disableAddMarker: false,
            disableDragMarker: false,
            disableNewSeq: false,
            disableLinkRemove: false
        });
        this.props.onLinkUpdate(linkDataArr);
    };

    checkIfLinkDirDrawn(checkCoor) {
        let holdCoorArr = [];
        for (let sequenceIndex = 0; sequenceIndex < this.state.linksData.length; sequenceIndex++) {
            holdCoorArr = this.state.linksData[sequenceIndex][0].geometry.coordinates;
            for (let coorIndex = 0; coorIndex < holdCoorArr.length; coorIndex++) {
                if (JSON.stringify(holdCoorArr[coorIndex][0]) === JSON.stringify(checkCoor[checkCoor.length - 1])) {
                    if (JSON.stringify(holdCoorArr[coorIndex][holdCoorArr[coorIndex].length - 1]) === JSON.stringify(checkCoor[0])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    drawLinks(linkDataArr, sequence) {
        let linkSources = [];
        let curr_map = this.state.map
        linkDataArr.forEach((link, index) => {
            const currSourceId = `route${sequence},${index}`;
            let overlappedBidirectionalCoor = [];
            let notOverlappedCoor = [];
            for (let i = 0; i < link.link_dirs.length; i++) {
                if (this.checkIfLinkDirDrawn(link.geometry.coordinates[i])) {
                    overlappedBidirectionalCoor.push(link.geometry.coordinates[i]);
                } else {
                    notOverlappedCoor.push(link.geometry.coordinates[i]);
                }
            }
            this.state.map.addSource(currSourceId + '1D', {
                'type': 'geojson',
                'maxzoom': 24,
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': link.geometry.type,
                        'coordinates': notOverlappedCoor
                    }
                }
            });
            this.state.map.addSource(currSourceId + '2D', {
                'type': 'geojson',
                'maxzoom': 24,
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': link.geometry.type,
                        'coordinates': overlappedBidirectionalCoor
                    }
                }
            });
            this.state.map.addLayer({
                'id': currSourceId + '1D',
                'type': 'line',
                'source': currSourceId + '1D',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': this.state.sequenceColours[sequence],
                    'line-width': 8
                }
            });
            this.state.map.addLayer({
                'id': currSourceId + '2D',
                'type': 'line',
                'source': currSourceId + '2D',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': this.state.sequenceColours[sequence],
                    'line-width': 8
                }
            });
            this.state.map.addLayer({
                'id': currSourceId + '1DL2',

                'type': 'symbol',
                'source': currSourceId + '1D',
                'layout': {
                    'symbol-placement': 'line-center',
                    'icon-image': 'arrow-line',
                    'icon-size': 0.02
                }
            });
            this.state.map.addLayer({
                'id': currSourceId + '2DL2',
                'type': 'symbol',
                'source': currSourceId + '2D',
                'layout': {
                    'symbol-placement': 'line-center',
                    'icon-image': 'double-arrow-line',
                    'icon-size': 0.1
                }
            });
            let popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });
            this.state.map.on('mouseenter', currSourceId + '1D', function (e) {
                curr_map.getCanvas().style.cursor = 'pointer';
                let coordinates = e.lngLat;
                let description = linkDataArr[0].path_name;
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                popup.setLngLat(coordinates).setHTML(description).addTo(curr_map);
            });
            this.state.map.on('mouseleave', currSourceId + '1D', function () {
                curr_map.getCanvas().style.cursor = '';
                popup.remove();
            });
            this.state.map.on('mouseenter', currSourceId + '2D', function (e) {
                curr_map.getCanvas().style.cursor = 'pointer';
                let coordinates = e.lngLat;
                let description = linkDataArr[0].path_name;
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                popup.setLngLat(coordinates).setHTML(description).addTo(curr_map);
            });
            this.state.map.on('mouseleave', currSourceId + '2D', function () {
                curr_map.getCanvas().style.cursor = '';
                popup.remove();
            });
            linkSources.push(currSourceId);
        });
        this.setState({displayedLinkSources: this.state.displayedLinkSources.concat(linkSources)});
    };

    removeAllLinkSources() {
        this.props.removeAllLinks();
        this.state.displayedLinkSources.forEach(linkSrc => {
            this.state.map.removeLayer(linkSrc + '1DL2');
            this.state.map.removeLayer(linkSrc + '2DL2');
            this.state.map.removeLayer(linkSrc + '1D');
            this.state.map.removeLayer(linkSrc + '2D');
            this.state.map.removeSource(linkSrc + '1D');
            this.state.map.removeSource(linkSrc + '2D');
        });
        this.setState({displayedLinkSources: []});
    }

    resyncAllMarkers() {
        const restoreMarkers = [...this.state.displayedMarker[this.state.currentSequence]];

        for (let i = 0; i < restoreMarkers.length; i++) {
            let currMarker = restoreMarkers[i];
            let currNode = this.state.clickedNodes[this.state.currentSequence][i];

            const restoreCoordinate = {lat: currNode.geometry.coordinate[1], lng: currNode.geometry.coordinate[0]};
            currMarker.setLngLat(restoreCoordinate);
        }
        const newArray = [...this.state.displayedMarker];
        newArray[this.state.currentSequence] = restoreMarkers;
        this.setState({displayedMarker: newArray});
    }

    onDragEnd(marker) {
        if (this.state.disableDragMarker) {
            this.resyncAllMarkers(marker);
        } else {
            this.disableInteractions();

            let lngLat = marker.getLngLat();
            const nodeIndex = marker._element.id;
            updateClosestNode(this, {
                longitude: lngLat.lng,
                latitude: lngLat.lat,
                nodeIndex: nodeIndex
            });
        }
    }

    /* this function is called only by action.js after a marker drag */
    updateMarker(nodeIndex, nodeCandidates) {
        const newNode = nodeCandidates[0];
        if (this.isDuplicateMarker(newNode, nodeIndex)) {
            alert("Can not drag to the node right before it or after it!");
            this.setState({
                disableAddMarker: false,
                disableNodeRemove: false,
                disableGetLink: this.state.clickedNodes[this.state.currentSequence].length < 1,
                disableReset: false,
                disableLinkRemove: false,
                disableDragMarker: false,
                disableNewSeq: this.state.clickedNodes[this.state.currentSequence].length < 1

            });
            this.resyncAllMarkers();
        } else {
            let nodeSequence = nodeIndex.split(",")[0];
            let nodeSequenceIndex = nodeIndex.split(",")[1];
            const newMarkers = [...this.state.displayedMarker[nodeSequence]];
            const draggedMarker = newMarkers[nodeSequenceIndex];
            const newCoordinate = {lat: newNode.geometry.coordinate[1], lng: newNode.geometry.coordinate[0]};
            draggedMarker.setLngLat(newCoordinate);

            const newNodes = [...this.state.clickedNodes[nodeSequence]];
            newNodes[nodeSequenceIndex] = newNode;

            const newMarkersArray = [...this.state.displayedMarker];
            newMarkersArray[nodeSequence] = newMarkers;

            const newNodesArray = [...this.state.clickedNodes];
            newNodesArray[nodeSequence] = newNodes;
            // this is also where nodes are set
            this.setState({
                displayedMarker: newMarkersArray,
                clickedNodes: newNodesArray,
                disableAddMarker: false,
                disableNodeRemove: false,
                disableGetLink: this.state.clickedNodes[nodeSequence].length < 2,
                disableReset: false,
                disableLinkRemove: false,
                disableDragMarker: false,
                disableNewSeq: this.state.clickedNodes[nodeSequence].length < 2
            });
            this.props.onNodeUpdate(newNodesArray);
        }
    }

    isDuplicateMarker(newNode, orgIndex) {
        const prevNode = orgIndex > 0 && this.state.clickedNodes[this.state.currentSequence][orgIndex - 1];
        const nextNode = orgIndex < this.state.clickedNodes[this.state.currentSequence].length - 1 && this.state.clickedNodes[this.state.currentSequence][orgIndex + 1];

        return (prevNode && prevNode.nodeId === newNode.nodeId) || (nextNode && nextNode.nodeId === newNode.nodeId);
    }

    isDuplicateEndNode(newNode) {
        const lastNode = this.state.clickedNodes[this.state.currentSequence].length > 0 &&
            this.state.clickedNodes[this.state.currentSequence][this.state.clickedNodes[this.state.currentSequence].length - 1];

        return lastNode && lastNode.nodeId === newNode.nodeId;
    }

    /* this function is called only by action.js after adding a new marker */
    addNodeToMapDisplay(nodeCandidates) {
        const newNode = nodeCandidates[0];

        if (this.isDuplicateEndNode(newNode)) {
            alert("Can not select the same node as the last node!");
            this.setState({
                disableAddMarker: false,
                disableNodeRemove: false,
                disableGetLink: this.state.clickedNodes[this.state.currentSequence].length < 1,
                disableReset: false,
                disableLinkRemove: false,
                disableDragMarker: false
            });

        } else {
            const newMarker = new mapboxgl.Marker({
                draggable: true,
                "color": this.state.sequenceColours[this.state.currentSequence]
            }).setLngLat(newNode.geometry.coordinate).setPopup(new mapboxgl.Popup()
                .setText("Sequence Number: " + this.state.currentSequence.toString() + ", Node Number: "
                    + this.state.clickedNodes[this.state.currentSequence].length.toString() + ""))
                .addTo(this.state.map);
            newMarker._element.id = this.state.currentSequence.toString() + "," +
                this.state.clickedNodes[this.state.currentSequence].length.toString();
            newMarker.on('dragend', this.onDragEnd.bind(this, newMarker));
            const newMarkerDiv = newMarker.getElement();
            newMarkerDiv.addEventListener('mouseenter', () => newMarker.togglePopup());
            newMarkerDiv.addEventListener('mouseleave', () => newMarker.togglePopup());
            // This is where nodes set
            let newNodes = this.state.clickedNodes[this.state.currentSequence].concat([newNode]);
            let newNodesArr = [...this.state.clickedNodes];
            newNodesArr[this.state.currentSequence] = newNodes;
            let newMarkers = this.state.displayedMarker[this.state.currentSequence].concat([newMarker]);
            let newMarkersArr = [...this.state.displayedMarker];
            newMarkersArr[this.state.currentSequence] = newMarkers;
            this.setState({
                displayedMarker: newMarkersArr,
                clickedNodes: newNodesArr,
                disableAddMarker: false,
                disableNodeRemove: false,
                disableLinkRemove: false,
                disableGetLink: this.state.clickedNodes[this.state.currentSequence].length < 1,
                disableReset: false,
                disableDragMarker: false,
                disableNewSeq: newNodes.length < 2
            });
            this.props.onNodeUpdate(newNodesArr);
        }
    };

    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    removeNodes() {
        let tempCurrentSeq = this.state.currentSequence;
        const targetMarkerID = this.state.currentSequence.toString() + "," +
            (this.state.clickedNodes[this.state.currentSequence].length - 1).toString();
        let lastNodeNum = this.state.clickedNodes[this.state.currentSequence].length - 1;
        let getMarkers = document.getElementById(targetMarkerID);
        getMarkers.remove();
        let newDisplayedMarker = [...this.state.displayedMarker[this.state.currentSequence]];
        newDisplayedMarker.splice(lastNodeNum, 1);

        let newClickedNode = [...this.state.clickedNodes[this.state.currentSequence]];
        newClickedNode.splice(lastNodeNum, 1);

        let newArray = [...this.state.clickedNodes];
        newArray[this.state.currentSequence] = newClickedNode;

        const newDisplayedMarkerArray = [...this.state.displayedMarker];
        newDisplayedMarkerArray[this.state.currentSequence] = newDisplayedMarker;

        let tempColorArray = this.state.sequenceColours

        if (this.state.displayedMarker[this.state.currentSequence].length === 1) {
            tempCurrentSeq = tempCurrentSeq - 1;
            newArray.pop();
            newDisplayedMarkerArray.pop();
            tempColorArray.pop()
        }
        // this is where alll nodes are removed
        if (tempCurrentSeq === -1) {
        //     this.setState({
        //         clickedNodes: [[]],
        //         displayedMarker: [[]],
        //         disableGetLink: true, 
        //         disableNodeRemove: true,
        //         disableNewSeq: true,
        //         currentSequence:0,
        //         disableLinkRemove: false,
        //         sequenceColours: [this.getRandomColor()]
        //    });
        this.resetMap()
       }
       else{
           this.setState({
               clickedNodes: newArray, displayedMarker: newDisplayedMarkerArray,
               disableGetLink: tempCurrentSeq === this.state.currentSequence ? this.state.displayedMarker[tempCurrentSeq].length <= 2: this.state.displayedMarker[tempCurrentSeq].length <= 1, 
               disableNodeRemove: lastNodeNum <= 0 && tempCurrentSeq === -1,
               disableNewSeq: tempCurrentSeq === this.state.currentSequence ? this.state.displayedMarker[tempCurrentSeq].length <= 2: this.state.displayedMarker[tempCurrentSeq].length <= 1, 
               currentSequence:tempCurrentSeq,
               disableLinkRemove: false,
               sequenceColours: tempColorArray
           });
       }
        this.props.onNodeUpdate(newArray);
    }

    newSeq() {
        alert("New Sequence Created, Please Place a Node");
        let newColor = this.state.sequenceColours[0];
        while (this.state.sequenceColours.includes(newColor)) {
            newColor = this.getRandomColor();
        }
        this.setState({
            displayedMarker: this.state.displayedMarker.concat([[]]),
            currentSequence: this.state.currentSequence + 1,
            clickedNodes: this.state.clickedNodes.concat([[]]),
            sequenceColours: this.state.sequenceColours.concat([newColor]),
            disableNewSeq: true,
            disableGetLink: true,
            disableNodeRemove: true,
            disableLinkRemove: false
        });
    }

    onChangeSelectSeq = (e) => this.setState({selectedSeq: e.target.value});

    onSubmit = (e) => {
        e.preventDefault();
        if (this.state.selectedSeq.trim() === '') {
            alert("Please input a sequence");
            return;
        }
        if (isNaN(this.state.selectedSeq)) {
            alert("Please input a valid sequence");
            return;
        }
        if (this.state.selectedSeq < 0 || this.state.selectedSeq > this.state.displayedMarker.length - 1) {
            alert("Please input a valid sequence");
            return;
        }
        let tempCurrSequence = this.state.currentSequence + 1;
        let newColor = this.getRandomColor();
        let tempHoldSeq = this.state.clickedNodes[this.state.selectedSeq];

        let newClickedNodes = [];
        let newDisplayedMarkers = [];

        for (let i = 0; i < tempHoldSeq.length; i++) {
            let currNode = tempHoldSeq[tempHoldSeq.length - i - 1];
            const newMarker = new mapboxgl.Marker({draggable: true, "color": newColor})
                .setLngLat(currNode.geometry.coordinate)
                .setPopup(new mapboxgl.Popup().setText(
                    "Sequence Number: " + tempCurrSequence.toString() +
                    ", Node Number: " + i.toString() + ""))
                .addTo(this.state.map);
            newMarker._element.id = tempCurrSequence.toString() + "," + i.toString();
            newMarker.on('dragend', this.onDragEnd.bind(this, newMarker));
            const newMarkerDiv = newMarker.getElement();
            newMarkerDiv.addEventListener('mouseenter', () => newMarker.togglePopup());
            newMarkerDiv.addEventListener('mouseleave', () => newMarker.togglePopup());

            newClickedNodes.push(currNode);
            newDisplayedMarkers.push(newMarker);
        }
        alert("Reversed sequence " + this.state.selectedSeq);
        this.setState({
            displayedMarker: this.state.displayedMarker.concat([newDisplayedMarkers]),
            currentSequence: tempCurrSequence,
            clickedNodes: this.state.clickedNodes.concat([newClickedNodes]),
            sequenceColours: this.state.sequenceColours.concat([newColor])
        });
        this.props.onNodeUpdate(this.state.clickedNodes.concat([newClickedNodes]));
    }

    render() {
        return (
            <div>
                <div className='sidebarStyle'>
                    <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom} |
                        Current Sequence #{this.state.currentSequence}</div>
                </div>
                <div ref={element => this.mapContainer = element} className='mapContainer'/>

                <Form className='seq'>
                    <Form.Group>
                        <Form.Control type="email" placeholder="Sequence #" value={this.state.selectedSeq}
                                      onChange={this.onChangeSelectSeq}/>
                    </Form.Group>
                    <Button className='seq-button' variant="primary" type="submit" disabled={this.state.disableNewSeq}
                            onClick={this.onSubmit}>Reverse</Button>
                </Form>

                <Button variant="outline-primary" id='newSeq-button' disabled={this.state.disableNewSeq}
                        onClick={() => this.newSeq()} size="sm">New Sequence</Button>
                <Button variant="outline-primary" id='reset-button' disabled={this.state.disableReset}
                        onClick={() => this.resetMap()} size="sm">Reset Map</Button>
                <Button variant="outline-primary" id='remove-node-button' disabled={this.state.disableNodeRemove}
                        onClick={() => this.removeNodes()} size="sm">Remove Last Node</Button>
                <Button variant="outline-primary" id='remove-links-button' disabled={this.state.disableLinkRemove}
                        onClick={() => this.removeAllLinkSources()} size="sm">Remove All Links</Button>
                <Button variant="outline-primary" id='link-button' disabled={this.state.disableGetLink}
                        onClick={() => this.getLink()} size="sm">Update & Display Links</Button>
            </div>
        );
    };

}

export default Mapbox;
