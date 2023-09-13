import { useContext, useState, useEffect } from 'react'
import { DataContext } from './Layout'

export class TimeRange {
    #isActive // is currently focused by user
    #dataContext // SpatialData manages this
    #startTime
    #endTime // 
    constructor(dataContext){
        // make this one aware of all others
        this.#dataContext = dataContext
    }
    get isActive(){ return this.#isActive }
    activate(){
        this.#isActive = true
        this.#dataContext.timeRanges.forEach( tr => {
            if(tr != this) tr.deactivate()
        } )
    }
    get isComplete(){
        console.log('completeness tested')
        return this.#startTime && this.#endTime && this.#startTime < this.#endTime
    }
    deactivate(){
        this.#isActive = false
    }
    get name(){
        if(this.#startTime || this.#endTime){
            let start = this.#startTime?.toLocaleTimeString() ?? '???'
            let end = this.#endTime?.toLocaleTimeString() ?? '???'
            return `From ${start} to ${end}`
        }
        return 'New Time Range'
    }
    render(){
        return <TimeRangeElement timeRange={this}/>
    }
    static parseTime(timeString){
        let match = timeString.match(/^(\d{2}):(\d{2})$/)
        if(match){
            let [whatever,hours,minutes] = match
            return new Date(1970, 1, 1, parseInt(hours), parseInt(minutes))
        }
        return undefined
    }
    setStartTime(input){
        this.#startTime = TimeRange.parseTime(input)
        return this.#startTime
    }
    setEndTime(input){
        this.#endTime = TimeRange.parseTime(input)
        return this.#endTime
    }
    static timeFormatted(datetime){
        if(datetime){
            let hours = datetime.getHours()
            let mins = datetime.getMinutes()
            return `${hours < 10 ? '0'+hours : hours}:${mins < 10 ? '0'+mins : mins}`
        }
        return ''
    }
    get startTimeFormatted(){
        return TimeRange.timeFormatted(this.#startTime)
    }
    get endTimeFormatted(){
        return TimeRange.timeFormatted(this.#endTime)
    }
}

function TimeRangeElement({timeRange}){
    const [ startInput, setStartInput ] = useState(timeRange.startTimeFormatted)
    const [ endInput, setEndInput ] = useState(timeRange.endTimeFormatted)
    const { logActivity } = useContext(DataContext)
    useEffect(()=>{
        timeRange.setStartTime(startInput)
        logActivity('change start time')
    },[startInput])
    useEffect(()=>{
        timeRange.setEndTime(endInput)
        logActivity('change end time')
    },[endInput])
    return (
        <div onClick={()=>{
                if(!timeRange.isActive){
                    timeRange.activate()
                    logActivity('focus time range')
                }
            } }
        >
            <div className='timeRangeName'>{timeRange.name}</div>
            {timeRange.isActive && <>
                <div>
                    <label htmlFor='start-time'>
                        Start time
                    </label> <input type='text' name='start-time'
                        value={startInput}
                        placeholder='16:00'
                        onChange={e=>setStartInput(e.target.value)}
                    />
                    <br/>
                    <label htmlFor='end-time'>
                        End time
                    </label> <input type='text' name='end-time'
                        value={endInput}
                        placeholder='19:00'
                        onChange={e=>setEndInput(e.target.value)}
                    />
                </div>
            </> }
        </div>
    )
}