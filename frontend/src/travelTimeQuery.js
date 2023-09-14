export class TravelTimeQuery {
    #corridor
    #timeRange
    #dateRange
    #days
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
}