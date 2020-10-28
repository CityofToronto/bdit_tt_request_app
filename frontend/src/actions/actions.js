const axios = require('axios');
axios.defaults.withCredentials = true;
/* specify domain addr */
const domain = "http://backendtest-env.eba-aje3qmym.ca-central-1.elasticbeanstalk.com/";


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
			page.setState({closestNodes: arr});
		} else {
			alert("NOT ENOUGH CLOSEST NODE FOUND");
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
			alert("NO TIME BOUNDARY FOUND");
		}
	}).catch(err => {
		alert(err.response.data.error);
	})
};

/* GET links given two nodes */
export const getLinksBetweenNodes = (page, data) => {
	axios.get(`${domain}/link-nodes/${data.fromNodeId}/${data.toNodeId}`).then(res => {
		if (res.data) {
			page.setState({links: {
					source: res.data.source,
					target: res.data.target,
					linkDirs: res.data.link_dirs,
					geometry: {
						type: res.data.geometry.type,
						coordinates: res.data.geometry.coordinates
					}
				}});
		} else {
			alert("NO LINKS FOUND");
		}
	}).catch(err => {
		alert(err.response.data.error);
	})
};

/* GET project title */
export const getProjectTitle = (page) => {
	axios.get(`${domain}/`).then(res => {
		if (res.data) {
			page.setState({title: res.data});
		} else {
			alert("NO PROJECT TITLE");
		}
	}).catch(err => {
		alert(err.response.data.error);
	})
};

/* GET travel data of links */
export const getTravelData = (page) => {
	axios.get(`${domain}/travel-data`).then(res => {
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
			page.setState({closestNodes: arr});
		} else {
			alert("NO DATA FOUND FOR LINKS");
		}
	}).catch(err => {
		alert(err.response.data.error);
	})
};