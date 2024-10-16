import { Corridor } from './corridor.js'
import { TimeRange } from './timeRange.js'
import { DateRange } from './dateRange.js'
import { Days } from './days.js'
import { HolidayOption } from './holidayOption.js'
import { TravelTimeQuery } from './travelTimeQuery.js'
import { domain } from './domain.js'
import PQueue from 'p-queue'

// instantiated once, this is the data store for all spatial and temporal data
export class SpatialData {
    #factors = []
    #queries = new Map() // store/cache for travelTimeQueries, letting them remember their results if any
    #knownHolidays = []
    #dataDateRange = { minDate: undefined, maxDate: undefined }
    #queue = new PQueue({concurrency: 3})
    constructor(){
        this.#factors.push(new Days(this))
        this.#factors.push(new HolidayOption(this,true))
        fetch(`${domain}/holidays`)
            .then( response => response.json() )
            .then( holidayList => this.#knownHolidays = holidayList )
        fetch(`${domain}/date-range`)
            .then( response => response.json() )
            .then( dates => {
                // a raw date will be parsed as UTC time then converted to local
                // adding the 00:00:00 time component makes it read as local time
                this.#dataDateRange.minDate = new Date(`${dates.minDate}T00:00:00`)
                this.#dataDateRange.maxDate = new Date(`${dates.maxDate}T00:00:00`)
            } )
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
    get holidays(){ return this.#knownHolidays }
    get dateRange(){ return this.#dataDateRange }
    createCorridor(){
        let corridor = new Corridor(this)
        this.#factors.push(corridor)
        corridor.activate()
        return corridor
    }
    createTimeRange(){
        let tr = new TimeRange(this)
        this.#factors.push(tr)
        tr.activate()
        return tr
    }
    createDateRange(){
        let dr = new DateRange(this)
        this.#factors.push(dr)
        dr.activate()
        return dr
    }
    createDays(){
        let days = new Days(this)
        this.#factors.push(days)
        days.activate()
        this.updateQueries() // this is the only factor that starts out complete
        return days
    }
    get segments(){
        return this.corridors.flatMap( c => c.segments )
    }
    get nodes(){
        return this.segments.flatMap( s => [ s.fromNode, s.toNode ] )
    }
    dropFactor(factor){
        this.#factors = this.#factors.filter(f => f != factor)
        this.updateQueries()
    }
    deactivateOtherFactors(factor){
        this.#factors.forEach( f => {
            if(f != factor) f.deactivate()
        } )
    }
    includeHolidays(){
        this.holidayOptions.forEach( factor => {
            if(!factor.holidaysIncluded) this.dropFactor(factor)
        } )
        if(this.holidayOptions.length == 0){
            this.#factors.push(new HolidayOption(this,true))
        }
        this.updateQueries()
    }
    excludeHolidays(){
        this.holidayOptions.forEach( factor => {
            if(factor.holidaysIncluded) this.dropFactor(factor)
        } )
        if(this.holidayOptions.length == 0){
            this.#factors.push(new HolidayOption(this,false))
        }
        this.updateQueries()
    }
    includeAndExcludeHolidays(){
        console.assert(this.holidayOptions.length == 1)
        // add a factor for whatever the opposite of the existing one is
        this.#factors.push(
            new HolidayOption(
                this,
                ! this.holidayOptions[0].holidaysIncluded
            )
        )
        this.updateQueries() 
    }
    updateQueries(){
        // this should be run any time the inputs change to keep the list fresh
        // queries are the crossproduct of all complete/valid factors
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
        // add any new travelTimeRequests
        crossProduct.forEach( TTQ => {
            if( ! this.#queries.has(TTQ.URI) ){
                this.#queries.set(TTQ.URI,TTQ)
            }
        } )
        // remove any old/modified travelTimeRequests
        let currentURIs = new Set(crossProduct.map(TTI=>TTI.URI))
        let currentKeys = [...this.#queries.keys()]
        currentKeys.filter( key => ! currentURIs.has(key) )
            .forEach( key => this.#queries.delete(key) )
    }
    get travelTimeQueries(){
        return [...this.#queries.values()].sort((a,b)=> a.URI < b.URI ? -1 : 1)
    }
    fetchAllResults(){
        return this.#queue.addAll(
            this.travelTimeQueries
                .filter( TTQ => ! TTQ.hasData )
                .map( TTQ => () => TTQ.fetchData() )
        )
    }
    get queue(){ return this.#queue }
    get allQueriesHaveData(){
        return ( // some queries, all with data
            this.queryCount > 0
            && this.queryCount == this.queryCountFinished
        )
    }
    get queryCount(){ return this.#queries.size }
    get queryCountFinished(){
        return [...this.#queries.values()].filter(q=>q.hasData).length
    }
}
