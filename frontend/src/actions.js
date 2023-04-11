import Axios from "axios"
import { fields as allFields } from "./components/Layout/FieldSelectMenu/FieldSelectMenu"

const axios = require('axios')
axios.defaults.withCredentials = true
/* remote domain and local test domain */
const domain = process.env.NODE_ENV === 'development' ? 
    'http://127.0.0.1:5000' : 'https://10.160.2.198/tt-request-backend'
const fileDownload = require('js-file-download')

const handleResponseError = (err) => {
    console.error(err)

    if (!err || !err.response || !err.response.status) {
        alert("Error in React Actions! Check console for error.")
    } else {
        if (err.response.status === 500) {
            alert("Internal Server Error")
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
            name: node.name,
            geometry: {
                coordinate: node.geometry.coordinates,
                type: node.geometry.type
            }
        });
    });

    return nodeArr;
};


/* GET up to ten closest nodes given coordinate */
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

export function getDateBoundaries(){
    return axios.get(`${domain}/date-bounds`).then( ({data}) => {
        if(data) {
            return { 
                endDate: new Date(data.end_time),
                startDate: new Date(data.start_time)
            }
        } else {
            alert("FAILED TO GET END DATE")
        }
    }).catch(err => handleResponseError(err))
}


export const getTravelDataFile = ({fileType,timePeriods,listOfLinkDirs,start_date,end_date,include_holidays,days_of_week}, enableGetButton) => {
    if (!fileType) {
        fileType = 'csv'
    }
    const request_body = {
        time_periods: timePeriods,
        links: listOfLinkDirs,
        file_type: fileType,
        date_range: `[${start_date}, ${end_date}]`,
        holidays: include_holidays,
        days_of_week: days_of_week,
        columns: allFields.map(f=>f.column) // will always get all columns for now
    }
    Axios({
        url: `${domain}/aggregate-travel-times`,
        method: 'POST',
        responseType: 'blob',
        data: request_body
    }).then( ({data}) => {
        if (data) {
            fileDownload(data, `report.${fileType}`)
        } else {
            alert("Failed to do travel time aggregation")
        }
        enableGetButton();
    }).catch(err => {
        if (!err || !err.response.status) {
            console.error(err)
            alert("Error in React Actions! Check console for error.")
        } else {
            if (err.response.status === 500) {
                alert("Internal Server Error")
            } else {
                const blob = err.response.data
                const reader = new FileReader()
                reader.onload = function () {
                    alert(JSON.parse(this.result).error)
                }
                reader.readAsText(blob)
            }
        }
        enableGetButton();
    });
};
