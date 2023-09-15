import { domain } from './domain.js'

export class TravelTimeQuery {
    #corridor
    #timeRange
    #dateRange
    #days
    #travelTime
    constructor({corridor,timeRange,dateRange,days}){
        this.#corridor = corridor
        this.#timeRange = timeRange
        this.#dateRange = dateRange
        this.#days = days
    }
    get URI(){
        let path = `aggregate-travel-times`
        // from and to nodes
        path += `/${this.#corridor.intersections[0].id}/${this.#corridor.intersections[1].id}`
        // times - only hours supported right now :(
        path += `/${this.#timeRange.startHour}/${this.#timeRange.endHour}`
        // start and end dates
        path += `/${this.#dateRange.startDateFormatted}/${this.#dateRange.endDateFormatted}`
        // options not yet supported: holidays and days of week
        path += `/true/${this.#days.apiString}`
        return path
    }
    get corridor(){ return this.#corridor }
    get timeRange(){ return this.#timeRange }
    get dateRange(){ return this.#dateRange }
    get days(){ return this.#days }
    async fetchData(){
        return fetch(`${domain}/${this.URI}`)
            .then( response => response.json() )
            .then( data => {
                this.#travelTime = data.travel_time
            } )
    }
    resultsRecord(type='json'){
        const record = {
            URI: this.URI,
            corridor: this.corridor.name,
            timeRange: this.timeRange.name,
            dateRange: this.dateRange.name,
            daysOfWeek: this.days.name,
            mean_travel_time_minutes: this.#travelTime
        }
        if(type=='json'){
            return record
        }else if(type='csv'){
            // TODO escape values!
            return Object.values(record).join(',')
        }
        return 'invalid type requested'
    }
    static csvHeader(){
        return 'URI,corridor,timeRange,dateRange,daysOfWeek,mean_travel_time_minutes'
    }
}