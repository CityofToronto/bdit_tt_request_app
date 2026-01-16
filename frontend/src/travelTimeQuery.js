import { domain } from './domain.js'
import { quantile } from 'd3-array'

export class TravelTimeQuery {
    #corridor
    #timeRange
    #dateRange
    #days
    #holidayOption
    #results
    #errorMessage
    constructor({corridor,timeRange,dateRange,days,holidayOption}){
        this.#corridor = corridor
        this.#timeRange = timeRange
        this.#dateRange = dateRange
        this.#days = days
        this.#holidayOption = holidayOption
    }
    get URI(){
        let path = `${domain}/aggregate-travel-times`
        // from and to nodes
        path += `/${this.#corridor.intersections[0].id}/${this.#corridor.intersections[1].id}`
        // times - only hours supported right now :(
        path += `/${this.#timeRange.startHour}/${this.#timeRange.endHour}`
        // start and end dates
        path += `/${this.#dateRange.startDateFormatted}/${this.#dateRange.endDateFormatted}`
        // holiday inclusion
        path += `/${this.#holidayOption.holidaysIncluded}`
        // days of week
        path += `/${this.#days.apiString}`
        return path
    }
    get corridor(){ return this.#corridor }
    get timeRange(){ return this.#timeRange }
    get dateRange(){ return this.#dateRange }
    get days(){ return this.#days }
    async fetchData(){
        if( this.hoursInRange < 1 ){
            // no possible data to fetch
            return this.#results = undefined
        }
        return fetch(this.URI)
            .then( response => response.json() )
            .then( data => {
                this.#results = data?.results
                this.#errorMessage = data?.error
            } )
            .catch( this.#errorMessage = 'unhandled server error' )
    }
    get hasData(){
        return Boolean(this.#results)
    }
    get isFinished(){
        return this.hasData || Boolean(this.#errorMessage)
    }
    get hoursInRange(){ // number of hours covered by query options
        let hoursPerDay = this.timeRange.hoursInRange
        let numDays = this.dateRange.daysInRange(this.days,this.#holidayOption)
        return hoursPerDay * numDays
    }
    get holidaysAreRelevant(){ // are holidays actually relevant for this query?
        const isodows = this.#days.ISODOWs
        const minDate = this.#dateRange.startDateFormatted
        const maxDate = this.#dateRange.endDateFormatted
        const holidays = this.#holidayOption.holidays.filter( holiday => {
            return (
                isodows.has(holiday.dow)
                && holiday.date >= minDate
                && holiday.date < maxDate
            )
        } )
        return holidays.length > 0
    }
    get caveats(){
        // offer some basic warnings where things look especially sketchy
        let warnings = new Set()
        // check sample size a couple different ways
        const n = this.#results?.observations?.length
        if(n == 0){
            warnings.add('no data available')
        }else if(n <= 5){
            warnings.add(`mean is based on only ${n} observation(s)`)
        }else if(n / this.hoursInRange < 0.2){
            warnings.add(`many time periods with missing or insufficient data`)
        }
        // check travel time variability
        const intervals = this.#results?.confidence?.intervals?.['p=0.95']
        if((intervals?.upper.seconds - intervals?.lower.seconds) >= this.#results?.travel_time?.seconds){
            warnings.add('travel times are highly variable')
        }
        return warnings
    }
    resultsRecord(type='json'){
        // map used instead of object to preserve insertion order
        const record = new Map()
        record.set('URI',this.URI)
        record.set('routeStreets',this.corridor.viaStreetsString)
        record.set('direction',this.corridor.bearing)
        record.set('startCrossStreets',this.corridor.startCrossStreetsString)
        record.set('endCrossStreets',this.corridor.endCrossStreetsString)
        record.set('timeRange',this.timeRange.name)
        record.set('dateRange',this.dateRange.name)
        record.set('daysOfWeek', this.days.name)
        record.set(
            'holidaysIncluded',
            this.holidaysAreRelevant ? this.#holidayOption.holidaysIncluded : 'NA'
        )
        record.set('hoursInRange', this.hoursInRange)
        record.set('mean_travel_time_minutes', this.#results?.travel_time?.minutes)
        record.set('mean_travel_time_seconds', this.#results?.travel_time?.seconds)
        // print errors if any, else warnings if any
        record.set('notes', this.#errorMessage ?? [...this.caveats].join('; '))
        // turning these off in the frontend until they're ready for production
        //record.set('moe_lower_p95', this.#results?.confidence?.intervals?.['p=0.95']?.lower?.seconds)
        //record.set('moe_upper_p95', this.#results?.confidence?.intervals?.['p=0.95']?.upper?.seconds)
        record.set('n', this.#results.observations.length)
        record.set(
            '95th percentile (seconds)',
            quantile(
                this.#results.observations.map(obs => obs.seconds),
                0.95
            )
        )
        record.set(
            '85th percentile (seconds)',
            quantile(
                this.#results.observations.map(obs => obs.seconds),
                0.85
            )
        )
        if(type=='json'){
            return Object.fromEntries(record) // can't JSONify maps
        }else if(type=='csv'){
            // add double quotes to strings and concatenate
            return [...record.values()]
                .map( value => typeof value == 'string' ? `"${value}"` : value )
                .join(',')
        }
        // the keys of a map record are used to create the CSV header
        return record
    }
}