import { Corridor } from './corridor.js'
import { TimeRange } from './timeRange.js'
import { DateRange } from './dateRange.js'

// instantiated once, this is the data store for all spatial and temporal data
export class SpatialData {
    #factors = []
    constructor(){}
    get corridors(){ return this.#factors.filter( f => f instanceof Corridor ) }
    get timeRanges(){ return this.#factors.filter( f => f instanceof TimeRange ) }
    get dateRanges(){ return this.#factors.filter( f => f instanceof DateRange ) }
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
}
