const axios = require('axios');
axios.defaults.withCredentials = true;
/* remote domain and local test domain */
const domain = "http://backendtest-env.eba-aje3qmym.ca-central-1.elasticbeanstalk.com";
// const domain = "http://127.0.0.1:5000";

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
	}).catch(err => {
		alert(err.response.data.error);
	})
};

/* GET date time boundary of the data sets */
export const getDateBoundary = (page) => {
	axios.get(`${domain}/date-bounds`).then(res => {
		if (res.data) {
			page.setState({dateBoundary: {
					startTime: res.data.start_time,
					endTime: res.data.end_time
				}});
		} else {
			alert("FAILED TO FETCH DATE BOUNDARY");
		}
	}).catch(err => {
		alert(err.response.data.error);
	})
};

/* GET links given two nodes */
export const getLinksBetweenNodes = (page, data) => {
	axios.get(`${domain}/link-nodes/${data.fromNodeId}/${data.toNodeId}`).then(res => {
		if (res.data) {
			// page.drawLink(res.data);
			page.setState({linkData:page.state.linkData.concat([res.data]), buttondisable: false})
		} else {
			alert("FAILED TO FETCH LINKS BETWEEN NODES");
		}
	}).catch(err => {
		console.log(err)
		alert(err.response.data.error);
	})
};

/* GET project title */
export const getProjectTitle = (page) => {
	axios.get(`${domain}/`).then(res => {
		if (res.data) {
			page.setState({title: res.data});
		} else {
			alert("FAILED TO GET PROJECT TITLE");
		}
	}).catch(err => {
		alert(err.response.data.error);
	})
};

/* GET travel data of links */
/* sample data input: {
        "startTime": "2018-09-01 12:00:00",
        "endTime": "2018-09-01 23:00:00",
        "linkDirs": ["29492871T"]
	}
*/
export const getTravelData = (page, data) => {
	axios.post(`${domain}/travel-data`, {start_time: data.startTime, end_time: data.endTime, link_dirs: data.linkDirs}).then(res => {
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
	}).catch(err => {
		alert(err.response.data.error);
	})
};