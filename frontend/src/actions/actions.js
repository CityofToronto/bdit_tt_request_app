import Axios from "axios";
import {VALID_COLUMN_NAMES} from "../components/Layout/FieldSelectMenu/FieldSelectMenu";

const axios = require('axios');
axios.defaults.withCredentials = true;
/* remote domain and local test domain */
const domain = "http://backendproduction-env.eba-5qbcpngm.ca-central-1.elasticbeanstalk.com/";
// const domain = "http://127.0.0.1:5000";
const fileDownload = require('js-file-download');

const handleResponseError = (err) => {
    console.error(err)

    if (!err || !err.response || !err.response.status) {
        alert("Error in React Actions! Check console for error.");
    } else {
        if (err.response.status === 500) {
            alert("Internal Server Error");
        } else {
            alert(err.response.data.error);
        }
    }
};


const parseClosestNodeResponse = (res) => {
    const nodeArr = [];
    res.data.forEach((node) => {
        nodeArr.push({
            nodeId: node.node_id,
            name: node.name,
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
            if (res.data.length === 1) {
                const newNode = {
                    nodeId: res.data[0].node_id,
                    name: res.data[0].name,
                    geometry: {
                        coordinate: res.data[0].geometry.coordinates,
                        type: res.data[0].geometry.type
                    }
                }
                page.addNodeToMapDisplay(newNode)
            } else {
                const closestNodes = parseClosestNodeResponse(res);
                page.setState({nodeCandidates: closestNodes, nodeCandidateSelect: true})
            }
        } else {
            alert("FAILED TO FETCH CLOSEST NODE");
        }
    }).catch(err => handleResponseError(err));
};

/* GET update closest node given coordinate */
export const updateClosestNode = (page, data) => {
    axios.get(`${domain}/closest-node/${data.longitude}/${data.latitude}`).then(res => {
        if (res.data) {
            if (res.data.length === 1) {
                const newNode = {
                    nodeId: res.data[0].node_id,
                    name: res.data[0].name,
                    geometry: {
                        coordinate: res.data[0].geometry.coordinates,
                        type: res.data[0].geometry.type
                    }
                }
                page.updateMarker(data.nodeIndex, newNode)
            } else {
                const closestNodes = parseClosestNodeResponse(res);
                page.setState({
                    updateNodeCandidates: closestNodes,
                    updateNodeCandidateSelect: true,
                    updateNodeIndex: data.nodeIndex
                })
            }
        } else {
            alert("FAILED TO FETCH CLOSEST NODE");
        }
    }).catch(err => handleResponseError(err));
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
    }).catch(err => handleResponseError(err));
};

/* GET links given two nodes */
export const getLinksBetweenNodes = (page, nodes) => {
    let seq = 0
    nodes.forEach((sequence) => {
        const nodeIds = [];
        sequence.forEach((node) => {
            nodeIds.push(node.nodeId);
        });
        axios.post(`${domain}/link-nodes`, {"node_ids": nodeIds}).then(res => {
            if (res.data) {
                page.displayLinks(res.data, nodes.indexOf(sequence), (seq === nodes.length - 1));
                seq++;
            } else {
                alert("FAILED TO FETCH LINKS BETWEEN NODES");
            }
        }).catch(err => {
            handleResponseError(err);
            page.enableInteractions()
        });
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
    }).catch(err => handleResponseError(err));
};


/* GET end date bound */
export const getDateBoundaries = (page) => {
    axios.get(`${domain}/date-bounds`).then(res => {
        if (res.data) {
            page.setState({maxDate: new Date(res.data.end_time), minDate: new Date(res.data.start_time)});
        } else {
            alert("FAILED TO GET END DATE");
        }
    }).catch(err => handleResponseError(err));
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

    let req_body;
    if (!data.fields.includes(true)){
        req_body = {
            list_of_time_periods: data.listOfTimePeriods,
            list_of_links: data.listOfLinkDirs,
            file_type: data.fileType,
            start_date: data.start_date,
            end_date: data.end_date,
            include_holidays: data.include_holidays,
            days_of_week: data.days_of_week,
        }
    } else {
        let columns = [];
        data.fields.forEach((value, index) => {
            if (value){
                columns.push(VALID_COLUMN_NAMES[index]);
            }
        });
        req_body = {
            list_of_time_periods: data.listOfTimePeriods,
            list_of_links: data.listOfLinkDirs,
            file_type: data.fileType,
            start_date: data.start_date,
            end_date: data.end_date,
            include_holidays: data.include_holidays,
            days_of_week: data.days_of_week,
            columns: columns
        }
    }

    Axios({
        url: `${domain}/travel-data-file`,
        method: 'POST',
        responseType: 'blob',
        data: req_body
    }).then(res => {
        if (res.data) {
            fileDownload(res.data, `report.${data.fileType}`);
        } else {
            alert("FAILED TO GET TRAVEL DATA FILE");
        }
        enableGetButton();
    }).catch(err => {
        if (!err || !err.response.status) {
            console.error(err);
            alert("Error in React Actions! Check console for error.");
        } else {
            if (err.response.status === 500) {
                alert("Internal Server Error");
            } else {
                const blob = err.response.data;
                const reader = new FileReader();
                reader.onload = function () {
                    alert(JSON.parse(this.result).error);
                };
                reader.readAsText(blob);
            }
        }
        enableGetButton();
    });
};
