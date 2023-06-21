/* test or production servers */
const domain = process.env.NODE_ENV === 'development' ? 
    'http://127.0.0.1:5001' : 'https://10.160.2.198/tt-request-backend'

function parseClosestNodeResponse(nodes){ // just renames some fields
    return nodes.map((node) => {
        return {
            nodeId: node.node_id,
            name: node.name,
            geometry: {
                coordinate: node.geometry.coordinates, // plural / singular?
                type: node.geometry.type
            }
        }
    })
};

/* GET up to ten closest nodes given coordinate */
export const getClosestNode = (page, data) => {
    fetch(`${domain}/closest-node/${data.longitude}/${data.latitude}`)
        .then( res => res.json() )
        .then( nodes => {
            if ( nodes.length === 1 ) {
                page.addNodeToMapDisplay( {
                    nodeId: nodes[0].node_id,
                    name: nodes[0].name,
                    geometry: {
                        coordinate: nodes[0].geometry.coordinates,
                        type: nodes[0].geometry.type
                    }
                } )
            } else {
                const closestNodes = parseClosestNodeResponse(nodes)
                page.setState({nodeCandidates: closestNodes, nodeCandidateSelect: true})
            }
    } )
}

/* update closest node given coordinate */
export const updateClosestNode = (page, data) => {
    fetch(`${domain}/closest-node/${data.longitude}/${data.latitude}`).then(res => {
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
    }).catch(console.error);
};

export function getLinksBetweenNodes(map, sequences){
    sequences.forEach( nodes => {
        const nodePairs = nodes.map( (node,i) => {
            if ( i > 0 ) return { from: nodes[i-1].nodeId, to: node.nodeId }
            return undefined
        } ).filter(v=>v)

        Promise.all( nodePairs.map( pair => (
            fetch(`${domain}/link-nodes/${pair.from}/${pair.to}`).then(r=>r.json())
        ) ) ).then( segments => map.displayLinks(segments,0) ) // the zero is a bad hack TODO fix this in Map
    } )
}

export function getDateBoundaries(){
    return fetch(`${domain}/date-bounds`)
        .then( res => res.json() )
        .then( ({start_time, end_time}) => {
            return { 
                endDate: new Date(end_time),
                startDate: new Date(start_time)
            }
        } )
}