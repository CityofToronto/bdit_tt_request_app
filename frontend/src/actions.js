/* test or production servers */
export const domain = process.env.NODE_ENV === 'development' ? 
    'http://localhost:5001' : 'https://10.160.2.198/tt-request-backend'

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