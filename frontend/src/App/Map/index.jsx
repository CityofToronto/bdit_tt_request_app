import { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import './Mapbox.css'
import { getClosestNode, updateClosestNode } from '../../actions.js'
import arrowImage from './images/arrow.png'
import doubleArrowImage from './images/doublearrow.png'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import ActionsBox from './ActionsBox'
import 'react-notifications/lib/notifications.css'
import { getRandomColor } from '../../colors'
mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vuc2IiLCJhIjoiY2tnb2E5ODZvMDlwMjJzcWhyamt5dWYwbCJ9.2uVkSjgGczylf1cmXdY9xQ'


// Note: Sequence and Segment are the same
export default class Map extends Component {
    constructor(props) {
        super(props)
        this.state = {
            map: null,
            displayedLinkSources: [],
            clickedNodes: [[]],
            displayedMarker: [[]],
            currentSequence: 0,
            sequenceColours: [getRandomColor()],
            disableNodeRemove: true,
            disableGetLink: true,
            disableReset: true,
            disableAddMarker: false,
            disableDragMarker: true,
            disableNewSeq: true,
            selectedSeq: "",
            linksData: [],
            disableLinkRemove: false,
            nodeCandidates: [],
            nodeCandidateSelect: false,
            updateNodeCandidates: [],
            updateNodeCandidateSelect: false,
            linkMouseEnter: [],
            linkMouseLeave: [],
            linksOnMap: false,
            updateNodeIndex: 0,
        }
        this.onSubmit = this.onSubmit.bind(this)
        this.newSeq = this.newSeq.bind(this)
        this.removeNodes = this.removeNodes.bind(this)
        this.resetMap = this.resetMap.bind(this)
        this.removeAllLinkSources = this.removeAllLinkSources.bind(this)
        this.getLink = this.getLink.bind(this)
        this.onChangeSelectSeq = this.onChangeSelectSeq.bind(this)
    }

    componentDidMount() {
        this.createMap()
    }

    createMap() {
        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-79.34299, 43.65720],
            zoom: 15,
            attributionControl: false
        });
        map.on('load', () => { // the two arrow images
            map.loadImage(
                arrowImage,
                function (error, image) {
                    if (error) throw error
                    map.addImage('arrow-line', image)
                })
            map.loadImage(
                doubleArrowImage,
                function (error, image) {
                    if (error) throw error
                    map.addImage('double-arrow-line', image)
                })
        })
        map.on('click', (e) => {
            if (!this.state.disableAddMarker) {
                this.disableInteractions()
                getClosestNode(this, {longitude: e.lngLat.lng, latitude: e.lngLat.lat})
            }
        })
        this.setState({map})
    }

    resetMap() {
        this.state.map.remove();
        this.createMap();
        this.props.resetMapVars();
        NotificationManager.success('Reset Map');
    }
    // all interactions on the map are disabled until data is returned by backend
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

    enableInteractions() {
        this.setState({
            disableGetLink: false,
            disableNodeRemove: false,
            disableAddMarker: false,
            disableReset: false,
            disableDragMarker: false,
            disableNewSeq: false,
            disableLinkRemove: false
        });
        this.forceUpdate();
    }
    // call backend to get links
    getLink() {
        this.disableInteractions();
        this.removeAllLinkSources();
        this.props.getLinks(this);
    };

    /* this function is called only by action.js after full link data is fetch */
    displayLinks(linkDataArr, sequence) {
        this.drawLinks(linkDataArr, sequence)
        // This is where links are set
        this.setState(
            {
                linksData: this.state.linksData.concat([linkDataArr]),
                linksOnMap: true
            },
            () => this.enableInteractions() // re-enables buttons
        )
        this.props.onLinkUpdate(linkDataArr)
    };
    // check if there is already a link drawn in the reverse direction
    checkIfLinkDirDrawn(checkCoor, bidirection, other) {
        let holdCoorArr = [];
        for (let sequenceIndex = 0; sequenceIndex < this.state.linksData.length; sequenceIndex++) {
            for (let arrIndex = 0; arrIndex < this.state.linksData[sequenceIndex].length; arrIndex++) {
                holdCoorArr = this.state.linksData[sequenceIndex][arrIndex].geometry.coordinates;
                if (this.checkArrHelper1(checkCoor, holdCoorArr)) {
                    return true;
                }
            }
        }
        return this.checkArrHelper2(checkCoor, bidirection) || this.checkArrHelper2(checkCoor, other);
    }

    checkArrHelper1(checkCoor, arr) {
        for (let index = 0; index < arr.length; index++) {
            if (JSON.stringify(arr[index][0]) === JSON.stringify(checkCoor[checkCoor.length - 1])) {
                if (JSON.stringify(arr[index][arr[index].length - 1]) === JSON.stringify(checkCoor[0])) {
                    return true;
                }
            }
        }
        return false;
    }

    checkArrHelper2(checkCoor, arr) {
        let holdCoorArr = [];
        for (let linkPartIndex = 0; linkPartIndex < arr.length; linkPartIndex++) {
            for (let index = 0; index < arr[linkPartIndex].length; index++) {
                holdCoorArr = arr[linkPartIndex][index];
                if (JSON.stringify(holdCoorArr[0]) === JSON.stringify(checkCoor[checkCoor.length - 1])) {
                    if (JSON.stringify(holdCoorArr[holdCoorArr.length - 1]) === JSON.stringify(checkCoor[0])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    // draw the links on the map
    drawLinks(linkDataArr, sequence) {
        let linkSources = [];
        let curr_map = this.state.map;
        let tempLinkMouseEnter = this.state.linkMouseEnter;
        let tempLinkMouseLeave = this.state.linkMouseLeave;
        let notOverlappedCoors = [];
        let overlappedBidirectionalCoors = [];
        linkDataArr.forEach((link, index) => {
            const currSourceId = `route${sequence},${index}`;
            let overlappedBidirectionalCoor = [];
            let notOverlappedCoor = [];

            if (link.geometry.type === 'LineString') {
                link.geometry.type = 'MultiLineString';
                link.geometry.coordinates = [link.geometry.coordinates];
            }
            // check if there is already a link drawn in the reverse direction, if so, a double arrow will be drawn, otherwise, single arrow
            for (let i = 0; i < link.link_dirs.length; i++) {
                if (this.checkIfLinkDirDrawn(link.geometry.coordinates[i], overlappedBidirectionalCoors, notOverlappedCoors)) {
                    overlappedBidirectionalCoor.push(link.geometry.coordinates[i]);
                } else {
                    notOverlappedCoor.push(link.geometry.coordinates[i]);
                }
            }
            notOverlappedCoors.push(notOverlappedCoor);
            overlappedBidirectionalCoors.push(overlappedBidirectionalCoor);
            this.state.map.addSource(currSourceId + '1D', { //source for non overlapping links
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
            this.state.map.addSource(currSourceId + '2D', { //source for overlapping links
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
            this.state.map.addLayer({ //layer for non overlappinp links
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
            this.state.map.addLayer({ //layer for overlapping links
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
            this.state.map.addLayer({ //single arrow for non overlapping links
                'id': currSourceId + '1DL2',

                'type': 'symbol',
                'source': currSourceId + '1D',
                'layout': {
                    'symbol-placement': 'line-center',
                    'icon-image': 'arrow-line',
                    'icon-size': 0.02
                }
            });
            this.state.map.addLayer({ //double arrow for overlapping links
                'id': currSourceId + '2DL2',
                'type': 'symbol',
                'source': currSourceId + '2D',
                'layout': {
                    'symbol-placement': 'line-center',
                    'icon-image': 'double-arrow-line',
                    'icon-size': 0.1
                }
            });
            if (this.state.linkMouseEnter.length <= sequence) {
                while (this.state.linkMouseEnter.length <= sequence) {
                    tempLinkMouseEnter.push([]);
                    tempLinkMouseLeave.push([]);
                }
            } else { // remove previous popup after the links are updated
                this.state.map.off('mouseenter', currSourceId + '1D', tempLinkMouseEnter[sequence][index]);
                this.state.map.off('mouseleave', currSourceId + '1D', tempLinkMouseLeave[sequence][index]);
                this.state.map.off('mouseenter', currSourceId + '2D', tempLinkMouseEnter[sequence][index]);
                this.state.map.off('mouseleave', currSourceId + '2D', tempLinkMouseLeave[sequence][index]);
                tempLinkMouseEnter[sequence] = [];
                tempLinkMouseLeave[sequence] = [];
            }
            // create new popup for the link
            let popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });
            let newMouseEnter = function onMouseEnter(e) {
                curr_map.getCanvas().style.cursor = 'pointer';
                let coordinates = e.lngLat;
                let description = "<h3>" +link.path_name + "</h3>";
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                popup.setLngLat(coordinates).setHTML(description).addTo(curr_map);
            }
            let newMouseLeave = function onMouseLeave() {
                curr_map.getCanvas().style.cursor = '';
                popup.remove();
            }
            tempLinkMouseEnter[sequence].push(newMouseEnter)
            tempLinkMouseLeave[sequence].push(newMouseLeave)
            this.state.map.on('mouseenter', currSourceId + '1D', newMouseEnter);
            this.state.map.on('mouseleave', currSourceId + '1D', newMouseLeave);
            this.state.map.on('mouseenter', currSourceId + '2D', newMouseEnter);
            this.state.map.on('mouseleave', currSourceId + '2D', newMouseLeave);
            linkSources.push(currSourceId);
        });
        this.setState({
            displayedLinkSources: this.state.displayedLinkSources.concat(linkSources),
            linkMouseEnter: tempLinkMouseEnter,
            linkMouseLeave: tempLinkMouseLeave
        });
    };
    //remove all the drawn links on the map
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
        this.setState({displayedLinkSources: [], linksData: [], linksOnMap: false});
        NotificationManager.success('Updated Links');
    }
    // reposition the marker after dragging
    resyncAllMarkers() {
        const restoreMarkers = [...this.state.displayedMarker[this.state.currentSequence]];

        for (let i = 0; i < restoreMarkers.length; i++) {
            let currMarker = restoreMarkers[i];
            let currNode = this.state.clickedNodes[this.state.currentSequence][i];

            const restoreCoordinates = {
                lat: currNode.geometry.coordinates[1],
                lng: currNode.geometry.coordinates[0]
            }
            currMarker.setLngLat(restoreCoordinates)
        }
        const newArray = [...this.state.displayedMarker];
        newArray[this.state.currentSequence] = restoreMarkers;
        this.setState({displayedMarker: newArray});
    }
    // call after dragging a node
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
    updateMarker(nodeIndex, nodeCandidate, updateNodeCandidateClose) {
        const newNode = nodeCandidate;
        // prevent adding the same node as the last one
        if (this.isDuplicateMarker(newNode, nodeIndex)) {
            NotificationManager.error('Can not drag to the node right before it or after it!');
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
            // update the dragged marker
            let nodeSequence = nodeIndex.split(",")[0];
            let nodeSequenceIndex = nodeIndex.split(",")[1];
            const newMarkers = [...this.state.displayedMarker[nodeSequence]];
            const draggedMarker = newMarkers[nodeSequenceIndex];
            draggedMarker.setPopup(new mapboxgl.Popup()
                .setHTML("<h3><ul><li>Segment Number: " + nodeSequence.toString()+ "</li><li>Node Number: "
                + nodeSequenceIndex.toString() + "</li><li>Node Name: "
                + newNode.name.toString() + "</li><li>Node_ID: "+ newNode.node_id.toString() + "</li></ul></h3>")
               )
            const newCoordinate = {
                lat: newNode.geometry.coordinates[1],
                lng: newNode.geometry.coordinates[0]
            }
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
        if (updateNodeCandidateClose) {
            updateNodeCandidateClose();
        }
    }

    isDuplicateMarker(newNode, orgIndex) {
        const prevNode = orgIndex.split(",")[1] > 0 && this.state.clickedNodes[this.state.currentSequence][orgIndex.split(",")[1] - 1];
        const nextNode = orgIndex.split(",")[1] < this.state.clickedNodes[this.state.currentSequence].length - 1 && this.state.clickedNodes[this.state.currentSequence][orgIndex.split(",")[1] + 1];
        return (prevNode && prevNode.node_id === newNode.node_id) || (nextNode && nextNode.node_id === newNode.node_id);
    }

    isDuplicateEndNode(newNode) {
        const lastNode = this.state.clickedNodes[this.state.currentSequence].length > 0 &&
            this.state.clickedNodes[this.state.currentSequence][this.state.clickedNodes[this.state.currentSequence].length - 1];

        return lastNode && lastNode.node_id === newNode.node_id;
    }

    /* this function is called only by action.js after adding a new marker */
    addNodeToMapDisplay(nodeCandidate, nodeCandidateClose) {
        const newNode = nodeCandidate

        if (this.isDuplicateEndNode(newNode)) {
            NotificationManager.error('Can not select the same node as the last node!');
            this.setState({
                disableAddMarker: false,
                disableNodeRemove: false,
                disableGetLink: this.state.clickedNodes[this.state.currentSequence].length < 1,
                disableReset: false,
                disableLinkRemove: false,
                disableDragMarker: false
            });

        } else {
            // create a new marker after the map is clicked
            const newMarker = new mapboxgl.Marker({
                draggable: true,
                "color": this.state.sequenceColours[this.state.currentSequence]
            }).setLngLat(newNode.geometry.coordinates).setPopup(
                new mapboxgl.Popup()
                    .setHTML("<h3><ul><li>Segment Number: " + this.state.currentSequence.toString()+ "</li><li>Node Number: "
                    + this.state.clickedNodes[this.state.currentSequence].length.toString() + "</li><li>Node Name: "
                    + newNode.name.toString() + "</li><li>Node_ID: "+ newNode.node_id.toString() + "</li></ul></h3>")
            ).addTo(this.state.map);
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
        if (nodeCandidateClose) {
            nodeCandidateClose();
        }
    };

    //removes the last node placed on the map
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
            tempColorArray.pop();
            NotificationManager.warning('Removed Last Segment');
        }
        // this is where all nodes are removed
        if (tempCurrentSeq === -1) {
            this.resetMap();
        } else {
            this.setState({
                clickedNodes: newArray, displayedMarker: newDisplayedMarkerArray,
                disableGetLink: tempCurrentSeq === this.state.currentSequence ? this.state.displayedMarker[tempCurrentSeq].length <= 2 : this.state.displayedMarker[tempCurrentSeq].length <= 1,
                disableNodeRemove: lastNodeNum <= 0 && tempCurrentSeq === -1,
                disableNewSeq: tempCurrentSeq === this.state.currentSequence ? this.state.displayedMarker[tempCurrentSeq].length <= 2 : this.state.displayedMarker[tempCurrentSeq].length <= 1,
                currentSequence: tempCurrentSeq,
                disableLinkRemove: false,
                sequenceColours: tempColorArray
            });
        }
        this.props.onNodeUpdate(newArray);
        NotificationManager.success('Removed Last Node');
    }

    //Creates a new segment
    newSeq() {
        NotificationManager.success('New Segment Created, Please Place a Node');
        let newColor = this.state.sequenceColours[0];
        while (this.state.sequenceColours.includes(newColor)) {
            newColor = getRandomColor();
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

    nodeCandidateClose = () => {
        this.setState({nodeCandidateSelect: false});
    }

    updateNodeCandidateClose = () => {
        this.setState({updateNodeCandidateSelect: false});
    }

    onChangeSelectSeq = (e) => this.setState({selectedSeq: e.target.value});

    //The on submit function when reversing sequences
    onSubmit = (e) => {
        e.preventDefault();
        if (this.state.selectedSeq.trim() === '') {
            NotificationManager.error('Please Input a Segment');
            return;
        }
        if (isNaN(this.state.selectedSeq)) {
            NotificationManager.error('Please Input a Valid Segment');
            return;
        }
        if (this.state.selectedSeq < 0 || this.state.selectedSeq > this.state.displayedMarker.length - 1) {
            NotificationManager.error('Please Input a Valid Segment');
            return;
        }
        let tempCurrSequence = this.state.currentSequence + 1;
        let newColor = getRandomColor();
        let tempHoldSeq = this.state.clickedNodes[this.state.selectedSeq];

        let newClickedNodes = [];
        let newDisplayedMarkers = [];

        for (let i = 0; i < tempHoldSeq.length; i++) {
            let currNode = tempHoldSeq[tempHoldSeq.length - i - 1];
            const newMarker = new mapboxgl.Marker({draggable: true, "color": newColor})
                .setLngLat(currNode.geometry.coordinates)
                .setPopup(new mapboxgl.Popup()
                .setHTML("<h3><ul><li>Segment Number: " + tempCurrSequence.toString()+ "</li><li>Node Number: "
                + i.toString() + "</li><li>Node Name: "
                + currNode.name.toString() + "</li><li>Node_ID: "+ currNode.node_id.toString() + "</li></ul></h3>")
                )
                .addTo(this.state.map);
            newMarker._element.id = tempCurrSequence.toString() + "," + i.toString();
            newMarker.on('dragend', this.onDragEnd.bind(this, newMarker));
            const newMarkerDiv = newMarker.getElement();
            newMarkerDiv.addEventListener('mouseenter', () => newMarker.togglePopup());
            newMarkerDiv.addEventListener('mouseleave', () => newMarker.togglePopup());

            newClickedNodes.push(currNode);
            newDisplayedMarkers.push(newMarker);
        }
        NotificationManager.success("Reversed Segment " + this.state.selectedSeq);
        this.setState({
            displayedMarker: this.state.displayedMarker.concat([newDisplayedMarkers]),
            currentSequence: tempCurrSequence,
            clickedNodes: this.state.clickedNodes.concat([newClickedNodes]),
            sequenceColours: this.state.sequenceColours.concat([newColor]),
            selectedSeq: ""
        }, () => this.checkLink());
        this.props.onNodeUpdate(this.state.clickedNodes.concat([newClickedNodes]));
    }

    checkLink() {
        if (this.state.linksOnMap) {
            this.getLink();
        }
    }

    render() {
        return (
            <div>
                <div ref={element => this.mapContainer = element} className='mapContainer'/>
                <ActionsBox 
                    currentSequence={this.state.currentSequence}
                    seletedSeq={this.state.selectedSeq}
                    disableNewSeq={this.state.disableNewSeq}
                    disableReset={this.state.disableReset}
                    disableNodeRemove={this.state.disableNodeRemove}
                    disableLinkRemove={this.state.disableLinkRemove}
                    disableGetLink={this.state.disableGetLink}
                    reverseSeqeunceAction={this.onSubmit}
                    newSequenceAction={this.newSeq}
                    removeNodesAction={this.removeNodes}
                    resetMapAction={this.resetMap}
                    removeLinksAction={this.removeAllLinkSources}
                    updateLinksAction={this.getLink}
                    selectSequenceAction={this.onChangeSelectSeq}
                />
                <NotificationContainer/>
            </div>
        );
    };
}