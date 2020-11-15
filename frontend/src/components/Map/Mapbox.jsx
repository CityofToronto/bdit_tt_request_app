import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
import {getClosestNode, getTravelDataFile, updateClosestNode} from '../../actions/actions';
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
            clickedNodes: [[]],
            displayedMarker: [[]],
            currentSequence: 0,
            sequenceColours: ["#FF0000"],
            disableRemove: true,
            disableGetLink: true,
            disableReset: true,
            disableAddMarker: false,
            disableDragMarker: true,
            disableNewSeq: true
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
            travelDataFile: [],
            displayedMarker: [[]],
            linksData: [],
            disableAddMarker: false,
            disableRemove: true,
            disableGetLink: true,
            disableReset: false,
            disableDragMarker: false,
            disableNewSeq: true,
            currentSequence: 0
        });
    }

    resetMap() {
        this.state.map.remove()
        this.createMap()
        this.props.onLinkUpdate([]);
        this.props.onNodeUpdate([]);
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
            disableDragMarker: true,
            disableNewSeq: true
        });
        this.forceUpdate();
    }

    getLink() {
        this.disableInteractions();
        this.props.getLinks(this);
    };

    /* this function is called only by action.js after full link data is fetch */
    displayLinks(linkDataArr, sequence) {
        this.drawLinks(linkDataArr, sequence);
        /* comment this if does not want to disable dragging after get link */
        const lockedMarkers = [...this.state.displayedMarker[this.state.currentSequence]]
        lockedMarkers.forEach((marker) => {
            marker.setDraggable(false);
        });
        let newArray = [...this.state.displayedMarker]
        newArray[this.state.currentSequence] = lockedMarkers
        // This is where links are set
        this.setState({
            linksData: linkDataArr,
            disableReset: false,
            displayedMarker: newArray
        }, () => {
            //this.addTravelDataFiles(linkDataArr)
        });
        this.props.onLinkUpdate(linkDataArr);
    };

    drawLinks(linkDataArr, sequence) {
        linkDataArr.forEach((link, index) => {
            const currSourceId = `route${sequence},${index}`
            this.state.map.addSource(currSourceId, {
                'type': 'geojson',
                'maxzoom': 24,
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': link.geometry.type,
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
                    'line-color': this.state.sequenceColours[sequence],
                    'line-width': 8
                }
            });
        });
    };

    resyncAllMarkers(){
        const restoreMarkers = [...this.state.displayedMarker[this.state.currentSequence]]

        for (let i = 0; i < restoreMarkers.length; i++) {
            let currMarker = restoreMarkers[i];
            let currNode = this.state.clickedNodes[this.state.currentSequence][i];

            const restoreCoordinate = {lat: currNode.geometry.coordinate[1], lng: currNode.geometry.coordinate[0]};
            currMarker.setLngLat(restoreCoordinate);
        }
        const newArray = [...this.state.displayedMarker]
        newArray[this.state.currentSequence] = restoreMarkers
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
                disableRemove: false,
                disableGetLink: this.state.clickedNodes[this.state.currentSequence].length < 1,
                disableReset: false,
                disableDragMarker: false,
                disableNewSeq: this.state.clickedNodes[this.state.currentSequence].length < 1
                
            });
            this.resyncAllMarkers();
        } else {
            let nodeSequence = nodeIndex.split(",")[0]
            let nodeSequenceIndex = nodeIndex.split(",")[1]
            const newMarkers = [...this.state.displayedMarker[nodeSequence]];
            const draggedMarker = newMarkers[nodeSequenceIndex];
            const newCoordinate = {lat: newNode.geometry.coordinate[1], lng: newNode.geometry.coordinate[0]};
            draggedMarker.setLngLat(newCoordinate);

            const newNodes = [...this.state.clickedNodes[nodeSequence]];
            newNodes[nodeSequenceIndex] = newNode

            const newMarkersArray = [...this.state.displayedMarker]
            newMarkersArray[nodeSequence] = newMarkers

            const newNodesArrary = [...this.state.clickedNodes]
            newNodesArrary[nodeSequence] = newNodes
            // this is also where nodes are set
            this.setState({
                displayedMarker: newMarkersArray,
                clickedNodes: newNodesArrary,
                disableAddMarker: false,
                disableRemove: false,
                disableGetLink: this.state.clickedNodes[nodeSequence].length < 2,
                disableReset: false,
                disableDragMarker: false,
                disableNewSeq: this.state.clickedNodes[nodeSequence].length < 2
            });
            this.props.onNodeUpdate(newNodesArrary);
        }
    }

    isDuplicateMarker(newNode, orgIndex){
        const prevNode = orgIndex > 0 && this.state.clickedNodes[this.state.currentSequence][orgIndex - 1];
        const nextNode = orgIndex < this.state.clickedNodes[this.state.currentSequence].length - 1 && this.state.clickedNodes[this.state.currentSequence][orgIndex + 1];

        return (prevNode && prevNode.nodeId === newNode.nodeId) || (nextNode && nextNode.nodeId === newNode.nodeId)
    }

    isDuplicateEndNode(newNode) {
        const lastNode = this.state.clickedNodes[this.state.currentSequence].length > 0 &&
            this.state.clickedNodes[this.state.currentSequence][this.state.clickedNodes[this.state.currentSequence].length - 1];

        return lastNode && lastNode.nodeId === newNode.nodeId
    }

    /* this function is called only by action.js after adding a new marker */
    addNodeToMapDisplay(nodeCandidates) {
        const newNode = nodeCandidates[0];

        if (this.isDuplicateEndNode(newNode)){
            alert("Can not select the same node as the last node!");
            this.setState({
                disableAddMarker: false,
                disableRemove: false,
                disableGetLink: this.state.clickedNodes[this.state.currentSequence].length < 1,
                disableReset: false,
                disableDragMarker: false
            });

        } else {
            const newMarker = new mapboxgl.Marker({draggable: true, "color": this.state.sequenceColours[this.state.currentSequence]})
                .setLngLat(newNode.geometry.coordinate)
                .addTo(this.state.map);
            newMarker._element.id = ""+this.state.currentSequence.toString()+","+this.state.clickedNodes[this.state.currentSequence].length.toString()+""
            newMarker.on('dragend', this.onDragEnd.bind(this, newMarker));

            // This is where nodes set
            let newNodes = this.state.clickedNodes[this.state.currentSequence].concat([newNode]);
            let newNodesArr = [...this.state.clickedNodes]
            newNodesArr[this.state.currentSequence] = newNodes
            let newMarkers = this.state.displayedMarker[this.state.currentSequence].concat([newMarker])
            let newMarkersArr = [...this.state.displayedMarker]
            newMarkersArr[this.state.currentSequence] = newMarkers
            this.setState({
                displayedMarker: newMarkersArr,
                clickedNodes: newNodesArr,
                disableAddMarker: false,
                disableRemove: false,
                disableGetLink: this.state.clickedNodes[this.state.currentSequence].length < 1,
                disableReset: false,
                disableDragMarker: false
            });
            if (newNodes.length >=2){
                this.setState({disableNewSeq: false})
            }
            this.props.onNodeUpdate(newNodesArr)
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
        let tempCurrentSeq = this.state.currentSequence
        const targetMarkerID = ""+this.state.currentSequence.toString()+","+(this.state.clickedNodes[this.state.currentSequence].length - 1).toString()+""
        let lastNodeNum = this.state.clickedNodes[this.state.currentSequence].length - 1;
        let getMarkers = document.getElementById(targetMarkerID);
        getMarkers.remove();
        let newDisplayedMarker = [...this.state.displayedMarker[this.state.currentSequence]];
        newDisplayedMarker.splice(lastNodeNum, 1);

        let newClickedNode = [...this.state.clickedNodes[this.state.currentSequence]];
        newClickedNode.splice(lastNodeNum, 1);

        let newArray = [...this.state.clickedNodes];
        newArray[this.state.currentSequence] = newClickedNode

        const newDisplayedMarkerArray = [...this.state.displayedMarker]
        newDisplayedMarkerArray[this.state.currentSequence] = newDisplayedMarker

        if (this.state.displayedMarker[this.state.currentSequence].length === 1) {
            tempCurrentSeq = tempCurrentSeq - 1
            newArray.pop()
            newDisplayedMarkerArray.pop()
        }
        // this is where nodes are removed
        this.setState({
            clickedNodes: newArray, displayedMarker: newDisplayedMarkerArray,
            disableGetLink: tempCurrentSeq === this.state.currentSequence ? this.state.displayedMarker[tempCurrentSeq].length <= 2: this.state.displayedMarker[tempCurrentSeq].length <= 1, 
            disableRemove: lastNodeNum <= 0 && tempCurrentSeq === -1,
            disableNewSeq: tempCurrentSeq === this.state.currentSequence ? this.state.displayedMarker[tempCurrentSeq].length <= 2: this.state.displayedMarker[tempCurrentSeq].length <= 1, 
            currentSequence:tempCurrentSeq
        });
        this.props.onNodeUpdate(newArray)
    }
    newSeq () {
        alert("New Sequence Created, Please Place a Node");
        let newColor = "#FF0000"
        while (this.state.sequenceColours.includes(newColor)) {
            newColor = this.getRandomColor()
        }
        this.setState({ displayedMarker: this.state.displayedMarker.concat([[]]),
                        currentSequence: this.state.currentSequence+1,
                        clickedNodes: this.state.clickedNodes.concat([[]]),
                        sequenceColours: this.state.sequenceColours.concat([newColor]),
                        disableNewSeq: true,
                        disableGetLink:true,
                        disableRemove: true
        })
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
                 <Button variant="outline-primary" className='newSeq-button' disabled={this.state.disableNewSeq}
                        onClick={() => this.newSeq()} size="sm">New Sequence</Button>
                         
            </div>
        );
    };

}

export default Mapbox;
