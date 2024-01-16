const URIpattern = /\/(?<startNode>\d+)\/(?<endNode>\d+)\/(?<startTime>\d+)\/(?<endTime>\d+)\/(?<startDate>\d{4}-\d{2}-\d{2})\/(?<endDate>\d{4}-\d{2}-\d{2})\/(?<holidays>true|false)\/(?<dow>\d+)/

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

            distinctPairs(URIs,'startNode','endNode')
                .forEach( ({startNode,endNode}) => {
                    console.log('unhandled corridor nodes',startNode,endNode)
                    /* TODO do something like - but more complicated!
                    let corridor = stateData.createCorridor()
                    corridor.addIntersection(startNode)
                    corridor.addIntersection(endNode)
                    */
                } )
            distinctPairs(URIs,'startTime','endTime')
                .forEach( ({startTime,endTime}) => {
                    let timeRange = stateData.createTimeRange()
                    timeRange.setStartTime(startTime)
                    timeRange.setEndTime(endTime)
                } )
            distinctPairs(URIs,'startDate','endDate')
                .forEach( ({startDate,endDate}) => {
                    let dateRange = stateData.createDateRange()
                    dateRange.setStartDate(new Date(Date.parse(startDate)))
                    dateRange.setEndDate(new Date(Date.parse(endDate)))
                } )
            // holiday inclusion
            let holidays = new Set(URIs.map(uri => uri.holidays))
            if(holidays.has('true') && holidays.has('false')){
                stateData.includeAndExcludeHolidays()
            }else if(holidays.has('true')){
                stateData.includeHolidays()
            }else{
                stateData.excludeHolidays()
            }
            // days of week
            // TODO: drop the default selection?
            [... new Set(URIs.map(uri=>uri.dow))].forEach( dowsString => {
                let daysFactor = stateData.createDays()
                daysFactor.setFromSet(new Set(dowsString.split('').map(Number)))
            } )
        } )
}

// get distinct value pairs from a list of objects by their property names
// all are strings
function distinctPairs(list, prop1, prop2){
    let distinctKeys = new Set( list.map(o => `${o[prop1]} | ${o[prop2]}`) )
    return [...distinctKeys].map( k => {
        let vals = k.split(' | ')
        return { [prop1]: vals[0], [prop2]: vals[1] }
    } )
}