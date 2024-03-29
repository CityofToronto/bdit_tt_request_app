import { domain } from './domain.js'

export class TravelTimeQuery {
    #corridor
    #timeRange
    #dateRange
    #days
    #holidayOption
    #travelTime
    #estimatedSample
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
            return this.#travelTime = -999
        }
        return fetch(this.URI)
            .then( response => response.json() )
            .then( data => {
                this.#travelTime = data.travel_time
                this.#estimatedSample = data.estimated_vehicle_count
            } )
    }
    get hasData(){
        return Boolean(this.#travelTime)
    }
    get hoursInRange(){ // number of hours covered by query options
        let hoursPerDay = this.timeRange.hoursInRange
        let numDays = this.dateRange.daysInRange(this.days,this.#holidayOption)
        return hoursPerDay * numDays
    }
    resultsRecord(type='json'){
        // map used instead of object to preserve insertion order
        const record = new Map()
        record.set('URI',this.URI)
        record.set('routeStreets',this.corridor.viaStreetsString)
        record.set('startCrossStreets',this.corridor.startCrossStreetsString)
        record.set('endCrossStreets',this.corridor.endCrossStreetsString)
        record.set('timeRange',this.timeRange.name)
        record.set('dateRange',this.dateRange.name)
        record.set('daysOfWeek', this.days.name)
        record.set('holidaysIncluded', this.#holidayOption.holidaysIncluded)
        record.set('hoursInRange', this.hoursInRange)
        record.set('estimatedVehicleCount', this.#estimatedSample)
        record.set('mean_travel_time_minutes', this.#travelTime)
        record.set(
            'mean_travel_time_seconds',
            this.#travelTime ? 60 * this.#travelTime : null
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