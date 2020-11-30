import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
import {getClosestNode, updateClosestNode} from '../../actions/actions';
import {Button, TextField} from "@material-ui/core";
import arrowImage from '../Images/arrow.png';
import doubleArrowImage from '../Images/doublearrow.png';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

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
			disableLinkRemove: false,
			nodeCandidates: [],
			nodeCandidateSelect: false,
			linkMouseEnter: [],
			linkMouseLeave: [],
			linksOnMap: false
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
		map.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
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
				// if (this.state.clickedNodes[this.state.currentSequence].length >= 10) {
				//     alert("Currently only allow maximum 10 nodes on the map!");
				// } else {
				//     this.disableInteractions();
				//     getClosestNode(this, {longitude: e.lngLat.lng, latitude: e.lngLat.lat});
				// }
				this.disableInteractions();
				getClosestNode(this, {longitude: e.lngLat.lng, latitude: e.lngLat.lat});
			}

		});
		this.setState({
			map: map,
			clickedNodes: [[]],
			displayedMarker: [[]],
			linksData: [],
			displayedLinkSources: [],
			linkMouseEnter: [],
			linkMouseLeave: [],
			sequenceColours: [this.getRandomColor()],
			disableAddMarker: false,
			disableNodeRemove: true,
			disableGetLink: true,
			disableLinkRemove: false,
			disableReset: false,
			disableDragMarker: false,
			disableNewSeq: true,
			currentSequence: 0,
			selectedSeq: "",
			linksOnMap: false
		});
	}

	resetMap() {
		this.state.map.remove();
		this.createMap();
		this.props.resetMapVars();
		NotificationManager.success('Reset Map');
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

	getLink() {
		this.disableInteractions();
		this.removeAllLinkSources();
		this.props.getLinks(this);
	};

	/* this function is called only by action.js after full link data is fetch */
	displayLinks(linkDataArr, sequence, finished) {
		this.drawLinks(linkDataArr, sequence);
		// This is where links are set
		this.setState({
			linksData: this.state.linksData.concat([linkDataArr]),
			linksOnMap: true
		}, function () {
			if (finished) {
				this.enableInteractions()
			}
		});
		this.props.onLinkUpdate(linkDataArr);
	};

	checkIfLinkDirDrawn(checkCoor, bidirection, other) {
		let holdCoorArr = [];
		for (let sequenceIndex = 0; sequenceIndex < this.state.linksData.length; sequenceIndex++) {
			holdCoorArr = this.state.linksData[sequenceIndex][0].geometry.coordinates;
			if (this.checkArrHelper1(checkCoor, holdCoorArr)) {
				return true
			}
		}
		return this.checkArrHelper2(checkCoor, bidirection) || this.checkArrHelper2(checkCoor, other)
	}

	checkArrHelper1(checkCoor, arr) {
		for (let index = 0; index < arr.length; index++) {
			if (JSON.stringify(arr[index][0]) === JSON.stringify(checkCoor[checkCoor.length - 1])) {
				if (JSON.stringify(arr[index][arr[index].length - 1]) === JSON.stringify(checkCoor[0])) {
					return true;
				}
			}
		}
		return false
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
		return false
	}

	drawLinks(linkDataArr, sequence) {
		let linkSources = [];
		let curr_map = this.state.map
		let tempLinkMouseEnter = this.state.linkMouseEnter
		let tempLinkMouseLeave = this.state.linkMouseLeave
		let notOverlappedCoors = []
		let overlappedBidirectionalCoors = []
		linkDataArr.forEach((link, index) => {
			const currSourceId = `route${sequence},${index}`;
			let overlappedBidirectionalCoor = [];
			let notOverlappedCoor = [];

			if (link.geometry.type === 'LineString') {
				link.geometry.type = 'MultiLineString'
				link.geometry.coordinates = [link.geometry.coordinates]
			}

			for (let i = 0; i < link.link_dirs.length; i++) {
				if (this.checkIfLinkDirDrawn(link.geometry.coordinates[i], overlappedBidirectionalCoors, notOverlappedCoors)) {
					overlappedBidirectionalCoor.push(link.geometry.coordinates[i]);
				} else {
					notOverlappedCoor.push(link.geometry.coordinates[i]);
				}
			}
			notOverlappedCoors.push(notOverlappedCoor)
			overlappedBidirectionalCoors.push(overlappedBidirectionalCoor)
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
			if (this.state.linkMouseEnter.length <= sequence) {
				while (this.state.linkMouseEnter.length <= sequence) {
					tempLinkMouseEnter.push([])
					tempLinkMouseLeave.push([])
				}
			} else {
				this.state.map.off('mouseenter', currSourceId + '1D', tempLinkMouseEnter[sequence][index]);
				this.state.map.off('mouseleave', currSourceId + '1D', tempLinkMouseLeave[sequence][index]);
				this.state.map.off('mouseenter', currSourceId + '2D', tempLinkMouseEnter[sequence][index]);
				this.state.map.off('mouseleave', currSourceId + '2D', tempLinkMouseLeave[sequence][index]);
				tempLinkMouseEnter[sequence] = []
				tempLinkMouseLeave[sequence] = []
			}
			let popup = new mapboxgl.Popup({
				closeButton: false,
				closeOnClick: false
			});
			let newMouseEnter = function onMouseEnter(e) {
				curr_map.getCanvas().style.cursor = 'pointer';
				let coordinates = e.lngLat;
				let description = link.path_name;
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
			// alert("Can not drag to the node right before it or after it!");
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
			let nodeSequence = nodeIndex.split(",")[0];
			let nodeSequenceIndex = nodeIndex.split(",")[1];
			const newMarkers = [...this.state.displayedMarker[nodeSequence]];
			const draggedMarker = newMarkers[nodeSequenceIndex];
			draggedMarker.setPopup(new mapboxgl.Popup()
				.setText("Sequence Number: " + nodeSequence.toString() + ", Node Number: "
					+ nodeSequenceIndex.toString() + ", Node_ID: " + newNode.nodeId.toString()))
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
		const prevNode = orgIndex.split(",")[1] > 0 && this.state.clickedNodes[this.state.currentSequence][orgIndex.split(",")[1] - 1];
		const nextNode = orgIndex.split(",")[1] < this.state.clickedNodes[this.state.currentSequence].length - 1 && this.state.clickedNodes[this.state.currentSequence][orgIndex.split(",")[1] + 1];
		return (prevNode && prevNode.nodeId === newNode.nodeId) || (nextNode && nextNode.nodeId === newNode.nodeId);
	}

	isDuplicateEndNode(newNode) {
		const lastNode = this.state.clickedNodes[this.state.currentSequence].length > 0 &&
			this.state.clickedNodes[this.state.currentSequence][this.state.clickedNodes[this.state.currentSequence].length - 1];

		return lastNode && lastNode.nodeId === newNode.nodeId;
	}

	/* this function is called only by action.js after adding a new marker */
	addNodeToMapDisplay(nodeCandidate, nodeCandidateClose) {
		const newNode = nodeCandidate

		if (this.isDuplicateEndNode(newNode)) {
			// alert("Can not select the same node as the last node!");
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
			const newMarker = new mapboxgl.Marker({
				draggable: true,
				"color": this.state.sequenceColours[this.state.currentSequence]
			}).setLngLat(newNode.geometry.coordinate).setPopup(new mapboxgl.Popup()
				.setText("Sequence Number: " + this.state.currentSequence.toString() + ", Node Number: "
					+ this.state.clickedNodes[this.state.currentSequence].length.toString() + ", Node Name: " + newNode.name.toString() + ", Node_ID: " + newNode.nodeId.toString()))
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
		if (nodeCandidateClose) {
			nodeCandidateClose()
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
			NotificationManager.warning('Removed Last Sequence');
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

	newSeq() {
		// alert("New Sequence Created, Please Place a Node");
		NotificationManager.success('New Sequence Created, Please Place a Node');
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

	nodeCandidateClose = () => {
		this.setState({nodeCandidateSelect: false})
	}

	onChangeSelectSeq = (e) => this.setState({selectedSeq: e.target.value});

	onSubmit = (e) => {
		e.preventDefault();
		if (this.state.selectedSeq.trim() === '') {
			// alert("Please input a sequence");
			NotificationManager.error('Please input a sequence');
			return;
		}
		if (isNaN(this.state.selectedSeq)) {
			// alert("Please input a valid sequence");
			NotificationManager.error('Please input a valid sequence');
			return;
		}
		if (this.state.selectedSeq < 0 || this.state.selectedSeq > this.state.displayedMarker.length - 1) {
			// alert("Please input a valid sequence");
			NotificationManager.error('Please input a valid sequence');
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
					", Node Number: " + i.toString() + ", Node_ID: " + currNode.nodeId.toString()))
				.addTo(this.state.map);
			newMarker._element.id = tempCurrSequence.toString() + "," + i.toString();
			newMarker.on('dragend', this.onDragEnd.bind(this, newMarker));
			const newMarkerDiv = newMarker.getElement();
			newMarkerDiv.addEventListener('mouseenter', () => newMarker.togglePopup());
			newMarkerDiv.addEventListener('mouseleave', () => newMarker.togglePopup());

			newClickedNodes.push(currNode);
			newDisplayedMarkers.push(newMarker);
		}
		// alert("Reversed sequence " + this.state.selectedSeq);
		NotificationManager.success("Reversed sequence " + this.state.selectedSeq);
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
			this.getLink()
		}
	}

	render() {
		return (
			<div>
				<div ref={element => this.mapContainer = element} className='mapContainer'/>
				<Dialog onClose={this.nodeCandidateClose} open={this.state.nodeCandidateSelect}
				        disableBackdropClick={true}>
					<DialogTitle>Select a Closest Node</DialogTitle>
					<List>
						{this.state.nodeCandidates.map((nodeCandidate) => (
							<ListItem button
							          onClick={() => this.addNodeToMapDisplay(nodeCandidate, this.nodeCandidateClose)}
							          key={nodeCandidate.nodeId}>
								<ListItemText primary={"Name: " + nodeCandidate.name.toString() + ", ID: " + nodeCandidate.nodeId.toString()}/>
							</ListItem>
						))}
					</List>
				</Dialog>

				<div className="map-options">
					<form className="reverse-seq-input" noValidate autoComplete="off">
						<TextField label="Current Sequence" InputProps={{readOnly: true,}}
						           value={"Current Sequence #" + this.state.currentSequence}/>
						{/* <TextField label="Sequence #" variant="filled" value={this.state.selectedSeq}  onChange={this.onChangeSelectSeq}/> */}
						<TextField label="Reverse Seq #" value={this.state.selectedSeq}
						           onChange={this.onChangeSelectSeq} variant="filled"/>
					</form>
					<Button variant="contained" color="primary" size="small" id='reverseSeq-button'
					        disabled={this.state.disableNewSeq}
					        onClick={this.onSubmit}>Reverse</Button>
					<Button variant="contained" color="primary" size="small" id='newSeq-button'
					        disabled={this.state.disableNewSeq}
					        onClick={() => this.newSeq()}>New Sequence</Button>
					<Button variant="contained" color="primary" size="small" id='reset-button'
					        disabled={this.state.disableReset}
					        onClick={() => this.resetMap()}>Reset Map</Button>
					<Button variant="contained" color="primary" size="small" id='remove-node-button'
					        disabled={this.state.disableNodeRemove}
					        onClick={() => this.removeNodes()}>Remove Last Node</Button>
					<Button variant="contained" color="primary" size="small" id='remove-links-button'
					        disabled={this.state.disableLinkRemove}
					        onClick={() => this.removeAllLinkSources()}>Remove All Links</Button>
					<Button variant="contained" color="primary" size="small" id='link-button'
					        disabled={this.state.disableGetLink}
					        onClick={() => this.getLink()}>Update & Display Links</Button>
				</div>
				<NotificationContainer/>
			</div>
		);
	};

}

export default Mapbox;
