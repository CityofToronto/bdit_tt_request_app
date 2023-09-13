import { Factor } from './factor.js'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from './Layout'

export class DateRange extends Factor {
    #startDate
    #endDate
    constructor(dataContext){
        super(dataContext)
    }
    get isComplete(){
        return this.#startDate && this.#endDate && this.#startDate < this.#endDate
    }
    get name(){
        if(this.#startDate || this.#endDate){
            let start = this.#startDate?.toLocaleDateString() ?? '???'
            let end = this.#endDate?.toLocaleDateString() ?? '???'
            return `From ${start} to ${end}`
        }
        return 'New Date Range'
    }
    render(){
        return <DateRangeElement dateRange={this}/>
    }
    static parseDate(dateString){ 
        if(dateString.match(/^\d{4}-\d{2}-\d{2}$/)){
            return new Date(dateString)
        }
        return undefined
    }
    setStartDate(input){
        this.#startDate = DateRange.parseDate(input)
        return this.#startDate
    }
    setEndDate(input){
        this.#endDate = DateRange.parseDate(input)
        return this.#endDate
    }
    static dateFormatted(datetime){ // TODO
        if(datetime){
            return datetime.toISOString().substring(0,10)
        }
        return ''
    }
    get startDateFormatted(){
        return DateRange.dateFormatted(this.#startDate)
    }
    get endDateFormatted(){
        return DateRange.dateFormatted(this.#endDate)
    }
}

function DateRangeElement({dateRange}){
    const [ startInput, setStartInput ] = useState(dateRange.startDateFormatted)
    const [ endInput, setEndInput ] = useState(dateRange.endDateFormatted)
    const { logActivity } = useContext(DataContext)
    useEffect(()=>{
        dateRange.setStartDate(startInput)
        logActivity('change start date')
    },[startInput])
    useEffect(()=>{
        dateRange.setEndDate(endInput)
        logActivity('change end date')
    },[endInput])
    return (
        <div onClick={()=>{
                if(!dateRange.isActive){
                    dateRange.activate()
                    logActivity('focus date range')
                }
            } }
        >
            <div className='dateRangeName'>{dateRange.name}</div>
            {dateRange.isActive && <>
                <div>
                    <label htmlFor='start-date'>
                        Start date
                    </label> <input type='text' name='start-date'
                        value={startInput}
                        placeholder='2022-01-01'
                        onChange={e=>setStartInput(e.target.value)}
                    />
                    <br/>
                    <label htmlFor='end-date'>
                        End date
                    </label> <input type='text' name='end-date'
                        value={endInput}
                        placeholder='2022-02-01'
                        onChange={e=>setEndInput(e.target.value)}
                    />
                </div>
            </> }
        </div>
    )
}