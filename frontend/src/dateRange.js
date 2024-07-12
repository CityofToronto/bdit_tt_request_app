import { Factor } from './factor.js'
import { useContext, useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
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
    setStartDate(inputDate){
        this.#startDate = inputDate
        this.hasUpdated()
        return this.#startDate
    }
    setEndDate(inputDate){
        this.#endDate = inputDate
        this.hasUpdated()
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

const today = new Date()
const earliestDataDate = new Date('2017-01-01')

function DateRangeElement({dateRange}){
    const { logActivity } = useContext(DataContext)
    const [ selectedRange, setSelectedRange ] = useState(undefined)
    useEffect(()=>{
        if(!selectedRange) return;
        let [ start, end ] = selectedRange
        dateRange.setStartDate(start)
        dateRange.setEndDate(end)
        logActivity('dateRange selected/updated')
    },[selectedRange])
    return (
        <div>
            <div className='dateRangeName'>{dateRange.name}</div>
            {dateRange.isActive && <>
                <Calendar
                    value={selectedRange}
                    selectRange={true}
                    allowPartialRange={true}
                    onChange={setSelectedRange}
                    maxDate={today}
                    minDate={earliestDataDate}
                />
            </> }
        </div>
    )
}