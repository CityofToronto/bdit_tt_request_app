import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Mapbox.css';
import {
	getClosestNode,
	getLinksBetweenNodes,
	updateLinksBetweenNodes,
	updateClosestNode,
	getTravelDataFile
} from '../../actions/actions';
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
			clickedNodes: [],
			displayedMarker: [],
			linkData: [],
			removedisable: true,
			buttondisable: true,
			resetdisable: false,
			addmarker: true
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
			if (this.state.addmarker && this.state.clickedNodes.length < 10) {
				// console.log('A click event has occurred at ' + e.lngLat);
				getClosestNode(this, {longitude: e.lngLat.lng, latitude: e.lngLat.lat});
				this.setState({buttondisable: true, removedisable: true, addmarker: false})
				if (this.state.clickedNodes.length >= 1) {
					this.setState({resetdisable: true})
				}
			}

		});
		this.setState({
			map: map,
			clickedNodes: [],
			travelDataFile: [],
			displayedMarker: [],
			linkData: [],
			addmarker: true,
			removedisable: true,
			buttondisable: true,
			resetdisable: false
		});
	}

	resetMap() {
		this.state.map.remove()
		this.createMap()
	}

	addTravelDataFiles() {
		let totalLinkDirs = []
		for (let i = 0; i < this.state.linkData.length; i++) {
			totalLinkDirs = totalLinkDirs.concat(this.state.linkData[i].link_dirs)
		}
		getTravelDataFile(this, {
			startTime: "2018-09-01 12:00:00",
			endTime: "2018-09-01 23:00:00",
			linkDirs: totalLinkDirs,
			fileType: "csv"
		})
	}

	getLink() {
		this.addTravelDataFiles()
		this.drawLink(this.state.linkData)
		const tempMarkers = [...this.state.displayedMarker]
		for (let i = 0; i < tempMarkers.length; i++) {
			tempMarkers[i].setDraggable(false)
		}
		this.setState({buttondisable: true, removedisable: true, addmarker: false, displayedMarker: tempMarkers})
	};

	drawLink(link_data) {
		let links = []
		for (let i = 0; i < link_data.length; i++) {
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

	updateMarker(nodeId, newNode) {
		const tempMarkers = [...this.state.displayedMarker]
		const tempMarker = tempMarkers[nodeId]
		const lngLat = {lat: newNode.geometry.coordinate[1], lng: newNode.geometry.coordinate[0]}
		tempMarker.setLngLat(lngLat)
		const tempNodes = [...this.state.clickedNodes]
		tempNodes[nodeId] = newNode
		this.setState({displayedMarker: tempMarkers, clickedNodes: tempNodes}, () => {
			updateLinksBetweenNodes(this, {nodeId: nodeId})
		})
	}

	addNodeToMapDisplay(nodeCandidates) {
		const timesClicked = this.state.clickedNodes.length;
		let el = document.createElement('div');
		let markerNum = timesClicked + 1
		el.className = 'marker' + markerNum.toString();
		el.id = timesClicked.toString();

		const newMarker = new mapboxgl.Marker(el, {draggable: true})
			.setLngLat(nodeCandidates[0].geometry.coordinate)
			.addTo(this.state.map);

		const onDragEnd = () => {
			this.setState({removedisable: true, buttondisable: true, resetdisable: true})
			let lngLat = newMarker.getLngLat()
			const nodeId = parseInt(newMarker._element.id)
			updateClosestNode(this, {
				longitude: lngLat.lng,
				latitude: lngLat.lat,
				nodeId: nodeId
			})
		}


		newMarker.on('dragend', onDragEnd);

		if (timesClicked > 0) {
			getLinksBetweenNodes(this, {
				fromNodeId: this.state.clickedNodes[timesClicked - 1].nodeId,
				toNodeId: nodeCandidates[0].nodeId
			});
		}
		this.setState({
			displayedMarker: this.state.displayedMarker.concat([newMarker]),
			clickedNodes: this.state.clickedNodes.concat([nodeCandidates[0]])
		});

		if (this.state.clickedNodes.length === 1) {
			this.setState({removedisable: false, addmarker: true})
		}

	};

	removeNodes() {
		let lastnode = this.state.clickedNodes.length - 1
		let getMarkers = document.getElementById(lastnode);
		getMarkers.remove()

		let newArr = [...this.state.clickedNodes]
		newArr.splice(lastnode, 1)
		this.setState({clickedNodes: newArr})

		if (lastnode - 1 >= 0) {
			let newLink = [...this.state.linkData]
			newLink.splice(lastnode - 1, 1)
			this.setState({linkData: newLink})
		}

		this.setState({removedisable: this.state.resetdisable && this.state.buttondisable})
		if (lastnode === 0) {
			this.setState({removedisable: true})
		}
		if (lastnode === 1) {
			this.setState({buttondisable: true})
		}
	}

	render() {
		return (
			<div>
				<div className='sidebarStyle'>
					<div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
				</div>
				<div ref={element => this.mapContainer = element} className='mapContainer'/>
				<Button variant="outline-primary" className='remove-button' disabled={this.state.removedisable}
				        onClick={() => this.removeNodes()} size="sm">Remove Node</Button>

				<Button variant="outline-primary" className='link-button' disabled={this.state.buttondisable}
				        onClick={() => this.getLink()} size="sm">Get Link</Button>
				<Button variant="outline-primary" className='reset-button' disabled={this.state.resetdisable}
				        onClick={() => this.resetMap()} size="sm">Reset Map</Button>
			</div>
		);
	};
}

export default Mapbox;