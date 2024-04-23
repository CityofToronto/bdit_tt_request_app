import { Factor } from './factor.js'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from './Layout'

export class TimeRange extends Factor {
    #startTime
    #endTime // 
    constructor(dataContext){
        super(dataContext)
    }
    // returns values 0-23
    get startHour(){ return this.#startTime?.getHours() }
    // returns values 1-24
    get endHour(){
        // values 0-23
        // BUT if the final hour is midnight, return 24 instead of zero
        const hour = this.#endTime?.getHours()
        return hour > 0 ? hour : 24
    }
    get isComplete(){
        return this.#startTime && this.#endTime && this.#startTime < this.#endTime
    }
    get name(){
        if(this.#startTime || this.#endTime){
            let options = { hour: "2-digit", minute: "2-digit", hour12: false }
            let start = this.#startTime?.toLocaleTimeString('en-CA',options) ?? '???'
            let end = this.#endTime?.toLocaleTimeString('en-CA',options) ?? '???'
            return `From ${start} to ${end}`
        }
        return 'New Time Range'
    }
    render(){
        return <TimeRangeElement timeRange={this}/>
    }
    static parseTime(timeString){
        let match = timeString.match(/^(?<hours>\d{1,2})$/)
        if(match){
            let {hours} = match.groups
            return new Date(1970, 1, 1, parseInt(hours))
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
            return `${hours < 10 ? '0'+hours : hours}`
        }
        return ''
    }
    get startTimeFormatted(){
        return TimeRange.timeFormatted(this.#startTime)
    }
    get endTimeFormatted(){
        return TimeRange.timeFormatted(this.#endTime)
    }
    get hoursInRange(){ // how many hours are in the timeRange?
        if(! this.isComplete){ return undefined }
        return this.endHour - this.startHour
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
                        Start hour
                    </label> <input type='text' name='start-time'
                        value={startInput}
                        placeholder='HH'
                        onChange={e=>setStartInput(e.target.value)}
                    />
                    <br/>
                    <label htmlFor='end-time'>
                        End hour
                    </label> <input type='text' name='end-time'
                        value={endInput}
                        placeholder='HH'
                        onChange={e=>setEndInput(e.target.value)}
                    />
                </div>
            </> }
        </div>
    )
}