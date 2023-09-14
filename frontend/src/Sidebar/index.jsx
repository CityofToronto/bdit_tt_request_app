import { useContext, useState } from 'react'
import { DataContext } from '../Layout'

import FactorContainer from './FactorContainer'
import BigButton from './BigButton'
import FactorList from './FactorList'
import './sidebar.css'

export default function SidebarContent(){
    return (
        <div className="sidebarContent">
            <Welcome/>
            <CorridorsContainer/>
            <div className='big-math-symbol'>&#xd7;</div>
            <TimeRangesContainer/>
            <div className='big-math-symbol'>&#xd7;</div>
            <DateRangesContainer/>
            <div className='big-math-symbol'>=</div> 
            <Results/>
        </div>
    )
}

function Results(){
    const [results, setResults ] = useState(undefined)
    const { data } = useContext(DataContext)
    let corridors = data.corridors.filter(c=>c.isComplete)
    let timeRanges = data.timeRanges.filter(c=>c.isComplete)
    let dateRanges = data.dateRanges.filter(c=>c.isComplete)
    let numResults = corridors.length * timeRanges.length * dateRanges.length
    return (
        <div>
            {numResults} travel time{numResults == 1 ? '' : 's'} to estimate currently
            {numResults > 0 && 
                <BigButton onClick={()=>getAllTheData({corridors,timeRanges,dateRanges},setResults)}>
                    Submit Query
                </BigButton>
}
            {results && 
                <a download='results.csv'
                    href={`data:text/plain;charset=utf-8,${encodeURIComponent('sample data')}`}
                >
                    <BigButton>
                        Download results
                    </BigButton>
                </a>
            }
        </div>
    )
}

import { domain } from '../domain.js'

function getAllTheData({corridors,timeRanges,dateRanges},setResults){
    const crossProduct = []
    corridors.forEach( corridor => {
        timeRanges.forEach( timeRange => {
            dateRanges.forEach( dateRange => {
                crossProduct.push({corridor,timeRange,dateRange})
            } )
        } )
    })
    Promise.all(
        crossProduct.map( ({corridor,timeRange,dateRange}) => {
            // base path
            let path = `${domain}/aggregate-travel-times`
            // from and to nodes
            path += `/${corridor.intersections[0].id}/${corridor.intersections[1].id}`
            // times - only hours supported right now :(
            path += `/${timeRange.startHour}/${timeRange.endHour}`
            // start and end dates
            path += `/${dateRange.startDateFormatted}/${dateRange.endDateFormatted}`
            // options not yet supported: holidays and days of week
            path += '/true/1234567'
            return fetch(path).then( response => response.json() )
        } )
    ).then(results => setResults(results))
}

function TimeRangesContainer(){
    const { logActivity, data } = useContext(DataContext)
    function addATimeRange(){
        data.createTimeRange()
        logActivity('new time range')
    }
    return (
        <FactorContainer>
            <BigButton onClick={addATimeRange}>
                Create a new time range
            </BigButton>
            <FactorList factors={data.timeRanges}/>
        </FactorContainer>
    )
}

function DateRangesContainer(){
    const { logActivity, data } = useContext(DataContext)
    function addADateRange(){
        data.createDateRange()
        logActivity('new date range')
    }
    return (
        <FactorContainer>
            <BigButton onClick={addADateRange}>
                Create a new date range
            </BigButton>
            <FactorList factors={data.dateRanges}/>
        </FactorContainer>
    )
}

export function CorridorsContainer(){
    const { logActivity, data } = useContext(DataContext)
    function addACorridor(){
        data.createCorridor()
        logActivity('new corridor')
    }
    return (
        <FactorContainer>
            <BigButton onClick={addACorridor}>
                Create a new corridor
            </BigButton>
            <FactorList factors={data.corridors}/>
        </FactorContainer>
    )
}

function Welcome(){
    return ( <>
        <h2>Toronto Historic Travel Times</h2>
        <p>
            This application allows you to query averaged motor vehicle travel
            times across the city, as far back as 2012. Data come from a small
            sample of probe vehicles that report their location data 
            to <a href="https://www.here.com/">Here</a>. For more information on
            this application and our methodology 
            see <a href="https://github.com/CityofToronto/bdit_tt_request_app">
            the documentation</a>. 
        </p>
    </> )
}

