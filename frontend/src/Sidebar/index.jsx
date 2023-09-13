import { useContext } from 'react'
import { DataContext } from '../Layout'

import FactorContainer from './FactorContainer'
import CreateFactorButton from './CreateFactorButton'
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
    const { data } = useContext(DataContext)
    let corridors = data.corridors.filter(c=>c.isComplete)
    let timeRanges = data.timeRanges.filter(c=>c.isComplete)
    let dateRanges = data.dateRanges.filter(c=>c.isComplete)
    let numResults = corridors.length * timeRanges.length * dateRanges.length
    return (
        <div>
            {numResults} travel time{numResults == 1 ? '' : 's'} to estimate
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
            <CreateFactorButton onClick={addATimeRange}>
                Create a new time range
            </CreateFactorButton>
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
            <CreateFactorButton onClick={addADateRange}>
                Create a new date range
            </CreateFactorButton>
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
            <CreateFactorButton onClick={addACorridor}>
                Create a new corridor
            </CreateFactorButton>
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

