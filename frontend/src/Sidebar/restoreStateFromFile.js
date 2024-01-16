
const URIpattern = /\/(?<startNode>\d+)\/(?<endNode>\d+)\/(?<startTime>\d+)\/(?<endTime>\d+)/

export async function restoreStateFromFile(fileDropEvent,stateData){
    fileDropEvent.stopPropagation()
    fileDropEvent.preventDefault()

    // only handle one file at a time
    let file = fileDropEvent.dataTransfer.files[0]

    // TODO: handle CSV
    if( file.type != 'application/json' ) { return }

    return file.text()
        .then( text => JSON.parse(text) )
        .then( data => {
            // should be a list of objects each with a URI property
            let URIs = data.map( r => r.URI.match(URIpattern).groups )
            console.log(URIs)

            distinctPairs(URIs,'startTime','endTime')
                .forEach( ({startTime,endTime}) => {
                    let timeRange = stateData.createTimeRange()
                    timeRange.setStartTime(startTime)
                    timeRange.setEndTime(endTime)
                } )
        } )
}

function distinctPairs(list,prop1,prop2){
    let distinctKeys = new Set( list.map(o => `${o[prop1]} | ${o[prop2]}`) )
    return [...distinctKeys].map( k => {
        let vals = k.split(' | ')
        return { [prop1]: vals[0], [prop2]: vals[1] }
    } )
}