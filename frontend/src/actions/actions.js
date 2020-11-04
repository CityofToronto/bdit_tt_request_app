const axios = require('axios');
axios.defaults.withCredentials = true;
/* remote domain and local test domain */
const domain = "http://backendtest-env.eba-aje3qmym.ca-central-1.elasticbeanstalk.com";
// const domain = "http://127.0.0.1:5000";
const fileDownload = require('js-file-download');

const handleResponseError = (err) => {
	if (err.status === 500) {
		alert("Internal Server Error")
	} else {
		alert(err.response.data.error)
	}
}


/* GET ten closest node given coordinate */
export const getClosestNode = (page, data) => {
	axios.get(`${domain}/closest-node/${data.longitude}/${data.latitude}`).then(res => {
		if (res.data) {
			const arr = [];
			res.data.forEach((node) => {
				arr.push({
					nodeId: node.node_id,
					geometry: {
						coordinate: node.geometry.coordinates,
						type: node.geometry.type
					}
				});
			});
			page.addNodeToMapDisplay(arr);
		} else {
			alert("FAILED TO FETCH CLOSEST NODE");
		}
	}).catch(err => handleResponseError(err))
};

/* GET update closest node given coordinate */
export const updateClosestNode = (page, data) => {
	axios.get(`${domain}/closest-node/${data.longitude}/${data.latitude}`).then(res => {
		if (res.data) {
			const arr = [];
			res.data.forEach((node) => {
				arr.push({
					nodeId: node.node_id,
					geometry: {
						coordinate: node.geometry.coordinates,
						type: node.geometry.type
					}
				});
			});
			page.updateMarker(data.nodeId, arr[0])
		} else {
			alert("FAILED TO FETCH CLOSEST NODE");
		}
	}).catch(err => handleResponseError(err))
};

/* GET date time boundary of the data sets */
export const getDateBoundary = (page) => {
	axios.get(`${domain}/date-bounds`).then(res => {
		if (res.data) {
			page.setState({
				dateBoundary: {
					startTime: res.data.start_time,
					endTime: res.data.end_time
				}
			});
		} else {
			alert("FAILED TO FETCH DATE BOUNDARY");
		}
	}).catch(err => handleResponseError(err))
};

/* GET links given two nodes */
export const getLinksBetweenNodes = (page, data) => {
	axios.get(`${domain}/link-nodes/${data.fromNodeId}/${data.toNodeId}`).then(res => {
		if (res.data) {
			// page.drawLink(res.data);
			page.setState({
				linkData: page.state.linkData.concat([res.data]),
				removedisable: false,
				buttondisable: false,
				resetdisable: false,
				addmarker: true
			})
		} else {
			alert("FAILED TO FETCH LINKS BETWEEN NODES");
		}
	}).catch(err => handleResponseError(err))
};

/* GET links if nodes are updated */
export const updateLinksBetweenNodes = (page, data) => {
	let fromNodeId, toNodeId
	if (data.nodeId > 0) {
		fromNodeId = page.state.clickedNodes[data.nodeId - 1].nodeId
		toNodeId = page.state.clickedNodes[data.nodeId].nodeId
		axios.get(`${domain}/link-nodes/${fromNodeId}/${toNodeId}`).then(res => {
			if (res.data) {
				const tempLinkData = [...page.state.linkData]
				tempLinkData[data.nodeId - 1] = res.data
				page.setState({linkData: tempLinkData})
			} else {
				alert("FAILED TO FETCH LINKS BETWEEN NODES");
			}
		}).catch(err => handleResponseError(err))
	}
	if (data.nodeId < page.state.clickedNodes.length - 1) {
		fromNodeId = page.state.clickedNodes[data.nodeId].nodeId
		toNodeId = page.state.clickedNodes[data.nodeId + 1].nodeId
		axios.get(`${domain}/link-nodes/${fromNodeId}/${toNodeId}`).then(res => {
			if (res.data) {
				const tempLinkData = [...page.state.linkData]
				tempLinkData[data.nodeId] = res.data
				page.setState({linkData: tempLinkData})
			} else {
				alert("FAILED TO FETCH LINKS BETWEEN NODES");
			}
		}).catch(err => handleResponseError(err))
	}
	page.setState({removedisable: false, buttondisable: false, resetdisable: false})
};

/* GET project title */
export const getProjectTitle = (page) => {
	axios.get(`${domain}/`).then(res => {
		if (res.data) {
			page.setState({title: res.data});
		} else {
			alert("FAILED TO GET PROJECT TITLE");
		}
	}).catch(err => handleResponseError(err))
};

/* GET travel data of links */
/* sample data input: {
        "startTime": "2018-09-01 12:00:00",
        "endTime": "2018-09-01 23:00:00",
        "linkDirs": ["29492871T"]
	}
*/
export const getTravelData = (page, data) => {
	axios.post(`${domain}/travel-data`, {
		start_time: data.startTime,
		end_time: data.endTime,
		link_dirs: data.linkDirs
	}).then(res => {
		if (res.data) {
			const arr = [];
			res.data.forEach((link) => {
				arr.push({
					linkDir: link.link_dir,
					tx: link.tx,
					length: link.length,
					mean: link.mean,
					stddev: link.stddev,
					confidence: link.confidence,
					pct50: link.pct_50
				});
			});
			page.setState({travelData: arr});
		} else {
			alert("FAILED TO GET TRAVEL DATA");
		}
	}).catch(err => handleResponseError(err))
};

/* GET travel data file of link */
/* sample data input: {
        "startTime": "2018-09-01 12:00:00",
        "endTime": "2018-09-01 23:00:00",
        "linkDirs": ["29492871T"],
        "fileType": "csv"
	}
*/
export const getTravelDataFile = (page, data) => {
	axios.post(`${domain}/travel-data-file`, {
		start_time: data.startTime,
		end_time: data.endTime,
		link_dirs: data.linkDirs,
		file_type: data.fileType
	}).then(res => {
		if (res.data) {
			fileDownload(res.data, `report.${data.fileType}`)
		} else {
			alert("FAILED TO GET TRAVEL DATA FILE");
		}
	}).catch(err => handleResponseError(err))
};