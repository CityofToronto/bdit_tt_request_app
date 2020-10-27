const axios = require('axios');
axios.defaults.withCredentials = true;
/* specify domain addr */
const domain = "http://backendtest-env.eba-aje3qmym.ca-central-1.elasticbeanstalk.com/";


/* GET closest node given coordinate */
export const getClosestNode = (page, data) => {
	axios.get(`${domain}/closest-node/${data.latitude}/${data.longitude}`).then(res => {
		if (res.data) {
			page.setState({closestNode: {
				type: res.data.type,
					properties: {
						nodeId: res.data.properties.node_id
					},
					geometry: {
						type: res.data.geometry.type,
						coordinates: res.data.geometry.coordinates
					}
				}});
		} else {
			alert("NO CLOSEST NODE FOUND");
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
	axios.get(`${domain}/link-nodes/${data.from_node_id}/${data.to_node_id}`).then(res => {
		if (res.data) {
			page.setState({closestNode: {
					type: res.data.type,
					properties: {
						linkDir: res.data.properties.link_dir,
						linkId: res.data.properties.link_id,
						id: res.data.properties.id,
						stName: res.data.properties.st_name,
						source: res.data.properties.source,
						target: res.data.properties.target,
						length: res.data.properties.length
					},
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
			page.setState({travelData: res.data});
		} else {
			alert("NO DATA FOUND FOR LINKS");
		}
	}).catch(err => {
		alert(err.response.data.error);
	})
};