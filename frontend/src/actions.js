/* test or production servers */
const domain = process.env.NODE_ENV === 'development' ? 
    'http://localhost:5000' : 'https://10.160.2.198/tt-request-backend'

/* GET up to ten closest nodes given coordinate */
export const getClosestNode = (page, data) => {
    fetch(`${domain}/closest-node/${data.longitude}/${data.latitude}`)
        .then( res => res.json() )
        .then( nodes => {
            if ( nodes.length === 1 ) {
                page.addNodeToMapDisplay( nodes[0] )
            } else {
                const closestNodes = nodes
                page.setState({nodeCandidates: closestNodes, nodeCandidateSelect: true})
            }
    } )
}

/* update closest node given coordinate */
export const updateClosestNode = (page, data) => {
    fetch(`${domain}/closest-node/${data.longitude}/${data.latitude}`)
        .then( r => r.json() )
        .then( data => {
            if (data.length === 1) {
                const newNode = data[0];
                page.updateMarker(data.nodeIndex, newNode)
            } else {
                const closestNodes = data
                page.setState( {
                    updateNodeCandidates: closestNodes,
                    updateNodeCandidateSelect: true,
                    updateNodeIndex: data.nodeIndex
                } )
            }
        } )
}

export function getLinksBetweenNodes(map, sequences){
    sequences.forEach( nodes => {
        const nodePairs = nodes.map( (node,i) => {
            if ( i > 0 ) return { from: nodes[i-1].node_id, to: node.node_id }
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