import { useContext, useState } from 'react'
import { DataContext } from '../Layout'

import FactorContainer from './FactorContainer'
import BigButton from './BigButton'
import FactorList from './FactorList'
import { TravelTimeQuery } from '../travelTimeQuery.js'
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
            <div className='big-math-symbol'>&#xd7;</div>
            <DaysContainer/>
            <div className='big-math-symbol'>=</div> 
            <Results/>
        </div>
    )
}

function Results(){
    const [ results, setResults ] = useState(undefined)
    const [ isFetchingData, setIsFetchingData ] = useState(false)
    const { data } = useContext(DataContext)
    const numResults = data.travelTimeQueries.length
    return (
        <div>
            {numResults} travel time{numResults == 1 ? '' : 's'} to estimate currently
            {numResults > 0 && ! isFetchingData &&
                <BigButton onClick={()=>{
                    setResults(undefined)
                    setIsFetchingData(true)
                    data.fetchAllResults().then( () => {
                        setIsFetchingData(false)
                        setResults(data.travelTimeQueries) 
                    } )
                }}>
                    Submit Query
                </BigButton>
            }
            {isFetchingData &&
                <p>Please wait while your request is being processed</p>
            }
            {results && <>
                    <a download='results.json'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(results.map(r=>r.resultsRecord('json'))))}`}
                    >
                        <BigButton>
                            Download results as JSON
                        </BigButton>
                    </a>
                    <a download='results.csv'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(TravelTimeQuery.csvHeader() + '\n' + results.map(r=>r.resultsRecord('csv')).join('\n'))}`}
                    >
                        <BigButton>
                            Download results as CSV 
                        </BigButton>
                    </a>
                </>
            }
        </div>
    )
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

function DaysContainer(){
    const { logActivity, data } = useContext(DataContext)
    function addDays(){
        data.createDays()
        logActivity('new days added')
    }
    return (
        <FactorContainer>
            <BigButton onClick={addDays}>
                Create a new day of week selection
            </BigButton>
            <FactorList factors={data.days}/>
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

