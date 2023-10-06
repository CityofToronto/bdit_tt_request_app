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
            let start = DateRange.dateFormatted(this.#startDate) ?? '???'
            let end = DateRange.dateFormatted(this.#endDate) ?? '???'
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
    static dateFormatted(datetime){
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
    // number of days covered by this dateRange, considering DoW and holidays
    daysInRange(daysOptions,holidayOptions){
        // TODO: this logic is pretty convoluted - clean it up!!
        if( ! (this.isComplete && daysOptions.isComplete) ){
            return undefined
        }
        let holidayDates = new Set(holidayOptions.holidays.map(h=>h.date))
        // iterate each day in the range
        let d = new Date(this.#startDate.valueOf())
        let dayCount = 0
        const holidaysExcluded = ! holidayOptions.holidaysIncluded
        while(d < this.#endDate){
            let dow = d.getUTCDay()
            let isodow = dow == 0 ? 7 : dow
            if( daysOptions.hasDay(isodow) ){
                // if holidays are NOT included, check the date isn't a holiday
                if( ! ( holidaysExcluded && holidayDates.has(formatISODate(d)) ) ){
                    dayCount ++
                }
            }
            // incrememnt one day, modified in-place
            d.setUTCDate(d.getUTCDate() + 1)
        }
        return dayCount
    }
}

function formatISODate(dt){ // this is waaay too complicated... alas
    let year = dt.getUTCFullYear() // should be good
    let month = 1 + dt.getUTCMonth() // 0 - 11 -> 1 - 12
    let day = dt.getUTCDate() // 1 - 31
    return `${year}-${('0'+month).slice(-2)}-${('0'+day).slice(-2)}`
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
        <div>
            <div className='dateRangeName'>{dateRange.name}</div>
            {dateRange.isActive && <>
                <div>
                    <label htmlFor='start-date'>
                        Start date (inclusive)
                    </label> <input type='text' name='start-date'
                        value={startInput}
                        placeholder='YYYY-MM-DD'
                        onChange={e=>setStartInput(e.target.value)}
                    />
                    <br/>
                    <label htmlFor='end-date'>
                        End date (exclusive)
                    </label> <input type='text' name='end-date'
                        value={endInput}
                        placeholder='YYYY-MM-DD'
                        onChange={e=>setEndInput(e.target.value)}
                    />
                </div>
            </> }
        </div>
    )
}