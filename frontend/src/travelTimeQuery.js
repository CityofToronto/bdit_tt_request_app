import { domain } from './domain.js'

export class TravelTimeQuery {
    #corridor
    #timeRange
    #dateRange
    #days
    #holidayOption
    #travelTime
    constructor({corridor,timeRange,dateRange,days,holidayOption}){
        this.#corridor = corridor
        this.#timeRange = timeRange
        this.#dateRange = dateRange
        this.#days = days
        this.#holidayOption = holidayOption
    }
    get URI(){
        let path = `aggregate-travel-times`
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
        return fetch(`${domain}/${this.URI}`)
            .then( response => response.json() )
            .then( data => {
                this.#travelTime = data.travel_time
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
        const record = {
            URI: this.URI,
            corridor: this.corridor.name,
            timeRange: this.timeRange.name,
            dateRange: this.dateRange.name,
            daysOfWeek: this.days.name,
            holidaysIncluded: this.#holidayOption.holidaysIncluded,
            hoursInRange: this.hoursInRange,
            mean_travel_time_minutes: this.#travelTime
        }
        if(type=='json'){
            return record
        }else if(type=='csv'){
            return Object.values(record)
                .map( value => {
                    
                    if(typeof value == 'string'){
                        return `"${value}"`
                    }
                    return value
                } )
                .join(',')
        }
        return 'invalid type requested'
    }
    static csvHeader(){
        return 'URI,corridor,timeRange,dateRange,daysOfWeek,holidaysIncluded,hoursPossible,mean_travel_time_minutes'
    }
}