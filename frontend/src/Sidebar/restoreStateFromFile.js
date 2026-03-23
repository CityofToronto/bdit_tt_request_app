import { Intersection } from '../intersection.js'
import { domain } from '../domain.js'

const TTURIpattern = /\/(?<startNode>\d+)\/(?<endNode>\d+)\/(?<startTime>\d+)\/(?<endTime>\d+)\/(?<startDate>\d{4}-\d{2}-\d{2})\/(?<endDate>\d{4}-\d{2}-\d{2})\/(?<holidays>true|false)\/(?<dow>\d+)\??(noCache)?&?(excludeDates=(?<excludedDates>(\d{4}-\d{2}-\d{2},?)+))?/g
const CorridorURIpattern = /\/link-nodes\/here\/(?<startNode>\d+)\/(?<endNode>\d+)/g

export async function restoreStateFromFile(fileDropEvent,stateData,logActivity){
    fileDropEvent.stopPropagation()
    fileDropEvent.preventDefault()

    // only handle one file at a time
    let file = fileDropEvent.dataTransfer.files[0]

    return file.text()
        .then( textData => {
            // a list of objects each with a URI property
            const URIs = [
                ...textData.matchAll(TTURIpattern),
                ...textData.matchAll(CorridorURIpattern)
            ].map(m=>m.groups)
            distinctPerProps(URIs,'startNode','endNode')
                .forEach( ({startNode,endNode}) => {
                    let corridor = stateData.createCorridor()
                    Promise.all(
                        [startNode,endNode].map(node_id => {
                            return fetch(`${domain}/node/here/${node_id}`)
                            .then( resp => resp.json() )
                            .then( node => new Intersection( {
                                    id: node.node_id,
                                    lat: node.geometry.coordinates[1],
                                    lng: node.geometry.coordinates[0],
                                    streetNames: node.street_names
                                } )
                            )
                        } )
                    ).then( intersections => {
                        corridor.addIntersection(intersections[0],logActivity)
                        corridor.addIntersection(intersections[1],logActivity)
                    })
                } )
            distinctPerProps(URIs,'startTime','endTime')
                .forEach( ({startTime,endTime}) => {
                    let timeRange = stateData.createTimeRange()
                    timeRange.setStartTime(startTime)
                    timeRange.setEndTime(endTime)
                } )
            distinctPerProps(URIs,'startDate','endDate','excludedDates')
                .forEach( ({startDate,endDate,excludedDates}) => {
                    console.log('sd',startDate)
                    let dateRange = stateData.createDateRange()
                    dateRange.setStartDate(new Date(Date.parse(startDate)))
                    dateRange.setEndDate(new Date(Date.parse(endDate)))
                    if(excludedDates){
                        excludedDates.split(',').map( dateString => {
                            try {
                                dateRange.addExcludedDate(                            
                                    new Date(Date.parse(dateString))
                                )
                            } catch { /*do nothing if not parsed as date*/ }
                        } )
                        dateRange
                    }
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
            distinctPerProps(URIs,'dow').forEach( ({dow}) => {
                let daysFactor = stateData.createDays()
                daysFactor.setFromSet(new Set(dow.split('').map(Number)))
            } )
        } )
}

// get distinct sets of values from a list of objects by their property name(s)
function distinctPerProps(list, ...props){
    let distinctValues = new Set(
        list.filter(o => props.every(prop=> Object.hasOwn(o,prop)))
            .map(o => props.map(p=>o[p]).join(' // '))
    )
    return [...distinctValues].map( dk => {
        return Object.fromEntries(
            new Map(dk.split(' // ').map((value,i)=>[props[i],value]))
        )
    } )
}