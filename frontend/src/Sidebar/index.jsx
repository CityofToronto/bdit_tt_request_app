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
    const numResults = data.travelTimeQueries.length
    return (
        <div>
            {numResults} travel time{numResults == 1 ? '' : 's'} to estimate currently
            {numResults > 0 && 
                <BigButton onClick={()=>{
                    setResults(undefined)
                    getAllTheData(data.travelTimeQueries,setResults)
                }}>
                    Submit Query
                </BigButton>
}
            {results && <>
                    <a download='results.json'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(results))}`}
                    >
                        <BigButton>
                            Download results as JSON
                        </BigButton>
                    </a>
                    {false && <a download='results.csv'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent('lol')}`}
                    >
                        <BigButton>
                            Download results as CSV 
                        </BigButton>
                    </a>}
                </>
            }
        </div>
    )
}

import { domain } from '../domain.js'

function getAllTheData(travelTimeQueries,setResults){
    Promise.all(
        travelTimeQueries.map( TTQ => {
            return fetch(`${domain}/${TTQ.URI}`)
                .then( response => response.json() )
        } )
    ).then( results => setResults(results) )
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

