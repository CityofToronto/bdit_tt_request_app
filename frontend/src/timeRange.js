import { Factor } from './factor.js'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from './Layout'

export class TimeRange extends Factor {
    #startTime
    #endTime // 
    constructor(dataContext){
        super(dataContext)
    }
    get startHour(){ return this.#startTime?.getHours() }
    get endHour(){ return this.#endTime?.getHours() }
    get isComplete(){
        return this.#startTime && this.#endTime && this.#startTime < this.#endTime
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
        let match = timeString.match(/^(?<hours>\d{2}):(?<minutes>\d{2})$/)
        if(match){
            let {hours,minutes} = match.groups
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
        <div>
            <div className='timeRangeName'>{timeRange.name}</div>
            {timeRange.isActive && <>
                <div>
                    <label htmlFor='start-time'>
                        Start time
                    </label> <input type='text' name='start-time'
                        value={startInput}
                        placeholder='HH:MM'
                        onChange={e=>setStartInput(e.target.value)}
                    />
                    <br/>
                    <label htmlFor='end-time'>
                        End time
                    </label> <input type='text' name='end-time'
                        value={endInput}
                        placeholder='HH:MM'
                        onChange={e=>setEndInput(e.target.value)}
                    />
                </div>
            </> }
        </div>
    )
}