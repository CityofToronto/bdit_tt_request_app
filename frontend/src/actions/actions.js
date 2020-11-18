import Axios from "axios";

const axios = require('axios');
axios.defaults.withCredentials = true;
/* remote domain and local test domain */
const domain = "http://backendtest-env.eba-aje3qmym.ca-central-1.elasticbeanstalk.com";
// const domain = "http://127.0.0.1:5000";
const fileDownload = require('js-file-download');

const handleResponseError = (err) => {
    if (!err || !err.status) {
        console.error(err);
        alert("Error in React Actions! Check console for error.");
    } else {
        if (err.status === 500) {
            alert("Internal Server Error");
        } else {
            alert(err.response.data.error)
        }
    }
};


const parseClosestNodeResponse = (res) => {
    const nodeArr = [];
    res.data.forEach((node) => {
        nodeArr.push({
            nodeId: node.node_id,
            geometry: {
                coordinate: node.geometry.coordinates,
                type: node.geometry.type
            }
        });
    });

    return nodeArr;
};


/* GET ten closest node given coordinate */
export const getClosestNode = (page, data) => {
    axios.get(`${domain}/closest-node/${data.longitude}/${data.latitude}`).then(res => {
        if (res.data) {
            const tenClosestNodes = parseClosestNodeResponse(res);
            page.addNodeToMapDisplay(tenClosestNodes);
        } else {
            alert("FAILED TO FETCH CLOSEST NODE");
        }
    }).catch(err => handleResponseError(err))
};

/* GET update closest node given coordinate */
export const updateClosestNode = (page, data) => {
    axios.get(`${domain}/closest-node/${data.longitude}/${data.latitude}`).then(res => {
        if (res.data) {
            const tenClosestNodes = parseClosestNodeResponse(res);
            page.updateMarker(data.nodeIndex, tenClosestNodes);
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
export const getLinksBetweenNodes = (page, nodes) => {
    nodes.forEach((sequence) => {
        const nodeIds = [];
        sequence.forEach((node) => {
            nodeIds.push(node.nodeId);
        });
        axios.post(`${domain}/link-nodes`, {"node_ids": nodeIds}).then(res => {
            if (res.data) {
                page.displayLinks(res.data, nodes.indexOf(sequence));
               
            } else {
                alert("FAILED TO FETCH LINKS BETWEEN NODES");
            }
        }).catch(err => handleResponseError(err))
    });
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


/* GET travel data file of link */
/* sample data input: {
        "startTime": "2018-09-01 12:00:00",
        "endTime": "2018-09-01 23:00:00",
        "linkDirs": ["29492871T"],
        "fileType": "csv"
	}
*/
export const getTravelDataFile = (data, enableGetButton) => {
    if (!data.fileType) {
        data.fileType = 'csv';
    }

    Axios({
        url: `${domain}/travel-data-file`,
        method: 'POST',
        responseType: 'blob',
        data: {
            list_of_time_periods: data.listOfTimePeriods,
            list_of_links: data.listOfLinkDirs,
            file_type: data.fileType,
            file_args: data.fileArgs
        }
    }).then(res => {
        if (res.data) {
            fileDownload(res.data, `report.${data.fileType}`)
        } else {
            alert("FAILED TO GET TRAVEL DATA FILE");
        }
        enableGetButton()
    }).catch(err => handleResponseError(err))
};
