import { Corridor } from './corridor.js'
import { TimeRange } from './timeRange.js'
import { DateRange } from './dateRange.js'
import { Days } from './days.js'
import { HolidayOption } from './holidayOption.js'
import { TravelTimeQuery } from './travelTimeQuery.js'
import { domain } from './domain.js'

// instantiated once, this is the data store for all spatial and temporal data
export class SpatialData {
    #factors = []
    #queries = new Map() // store/cache for travelTimeQueries, letting them remember their results if any
    #knownHolidays = []
    constructor(){
        this.#factors.push(new Days(this))
        this.#factors.push(new HolidayOption(this,true))
        fetch(`${domain}/holidays`)
            .then( response => response.json() )
            .then( holidayList => this.#knownHolidays = holidayList )
    }
    get corridors(){ return this.#factors.filter( f => f instanceof Corridor ) }
    get timeRanges(){ return this.#factors.filter( f => f instanceof TimeRange ) }
    get dateRanges(){ return this.#factors.filter( f => f instanceof DateRange ) }
    get days(){ return this.#factors.filter( f => f instanceof Days ) }
    get holidayOptions(){
        return this.#factors.filter( f => f instanceof HolidayOption )
    }
    get activeCorridor(){
        return this.corridors.find( cor => cor.isActive )
    }
    createCorridor(){
        let corridor = new Corridor(this)
        this.#factors.push(corridor)
        corridor.activate()
    }
    createTimeRange(){
        let tr = new TimeRange(this)
        this.#factors.push(tr)
        tr.activate()
    }
    createDateRange(){
        let dr = new DateRange(this)
        this.#factors.push(dr)
        dr.activate()
    }
    createDays(){
        let days = new Days(this)
        this.#factors.push(days)
        days.activate()
    }
    get segments(){
        return this.corridors.flatMap( c => c.segments )
    }
    get nodes(){
        return this.segments.flatMap( s => [ s.fromNode, s.toNode ] )
    }
    dropFactor(factor){
        this.#factors = this.#factors.filter(f => f != factor)
    }
    deactivateOtherFactors(factor){
        this.#factors.forEach( f => {
            if(f != factor) f.deactivate()
        } )
    }
    includeHolidays(){
        this.holidayOptions.forEach(f => this.dropFactor(f))
        this.#factors.push(new HolidayOption(this,true))
    }
    excludeHolidays(){
        this.holidayOptions.forEach(f => this.dropFactor(f))
        this.#factors.push(new HolidayOption(this,false))
    }
    includeAndExcludeHolidays(){
        this.holidayOptions.forEach(f => this.dropFactor(f))
        this.#factors.push(new HolidayOption(this,true))
        this.#factors.push(new HolidayOption(this,false))
    }
    get travelTimeQueries(){
        // is the crossproduct of all complete/valid factors
        const crossProduct = []
        this.corridors.filter(c=>c.isComplete).forEach( corridor => {
            this.timeRanges.filter(tr=>tr.isComplete).forEach( timeRange => {
                this.dateRanges.filter(dr=>dr.isComplete).forEach( dateRange => {
                    this.days.filter(d=>d.isComplete).forEach( days => {
                        this.holidayOptions.forEach( holidayOption => {
                            crossProduct.push(
                                new TravelTimeQuery({
                                    corridor,
                                    timeRange,
                                    dateRange,
                                    days,
                                    holidayOption
                                })
                            )
                        } )
                    } )
                } )
            } )
        })
        // add new travelTimeRequests
        crossProduct.forEach( TTQ => {
            if( ! this.#queries.has(TTQ.URI) ){
                this.#queries.set(TTQ.URI,TTQ)
            }
        } )
        // remove old/modified travelTimeRequests
        let currentURIs = new Set(crossProduct.map(TTI=>TTI.URI))
        let currentKeys = [...this.#queries.keys()]
        currentKeys.filter( key => ! currentURIs.has(key) )
            .forEach( key => this.#queries.delete(key) )
        return [...this.#queries.values()]
    }
    fetchAllResults(){
        return Promise.all(
            this.travelTimeQueries
                .filter( TTQ => ! TTQ.hasData )
                .map( TTQ => TTQ.fetchData() )
        )
    }
}
