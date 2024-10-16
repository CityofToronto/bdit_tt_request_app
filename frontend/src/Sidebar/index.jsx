import { useContext } from 'react'
import { DataContext } from '../Layout'

import FactorContainer from './FactorContainer'
import BigButton from './BigButton'
import ResultsContainer from './ResultsContainer'
import FactorList from './FactorList'
import { restoreStateFromFile } from './restoreStateFromFile.js'
import './sidebar.css'

export default function SidebarContent(){
    const { data, logActivity } = useContext(DataContext)
    return (
        <div className="sidebarContent"
            onDragEnter={ e => { e.stopPropagation(); e.preventDefault() } }
            onDragOver={ e => { e.stopPropagation(); e.preventDefault() } }
            onDrop={ event => {
                restoreStateFromFile(event,data,logActivity)
                    .then( logActivity('state restored from file') ) // not working?
            } }
        >
            <Welcome/>
            <CorridorsContainer/>
            <TimeRangesContainer/>
            <DateRangesContainer/>
            <DaysContainer/>
            <HolidaysContainer/>
            <ResultsContainer/>
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
                Create a new day-of-week selection
            </BigButton>
            <FactorList factors={data.days}/>
        </FactorContainer>
    )
}

function HolidaysContainer(){
    const { logActivity, data } = useContext(DataContext)
    if( ! data.travelTimeQueries.some(ttq=>ttq.holidaysAreRelevant) ){
        return
    }
    let options = data.holidayOptions
    let included, excluded
    if(options.length == 1){
        included = options[0].holidaysIncluded
        excluded = ! included
    }else{
        included = true
        excluded = true
    }
    function handleChange(option){
        if(option=='no'){
            data.excludeHolidays()
        }else if(option=='yeah'){
            data.includeHolidays()
        }else{ // yeah no, eh?
            data.includeAndExcludeHolidays()
        }
        logActivity(`include holidays? ${option}`)
    }
    return (
        <FactorContainer>
            <div><b>Include holidays?</b></div>
            <label>
                <input type="radio" value="yes" 
                    checked={included && !excluded}
                    onChange={()=>handleChange('yeah')}
                />
                Yes
            </label>
            <br/>
            <label>
                <input type="radio" value="no"
                    checked={excluded && !included}
                    onChange={()=>handleChange('no')}
                />
                No
            </label>
            <br/>
            <label>
                <input type="radio" value="yeahNo"
                    checked={included&&excluded}
                    onChange={()=>handleChange('yeah no')}
                />
                Yes & No (do it both ways)
            </label>
        </FactorContainer>
    )
}

function Welcome(){
    return ( <>
        <h2>Toronto Historic Travel Times</h2>
        <p>
            This application allows you to query averaged motor vehicle travel
            times across the city, as far back as 2017. Data come from a small
            sample of probe vehicles that report their location data 
            to <a href="https://www.here.com/">Here</a>. For more information on
            this application and our methodology 
            see <a href="https://github.com/CityofToronto/bdit_tt_request_app">
            the documentation</a>. 
        </p>
    </> )
}

