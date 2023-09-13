import { Corridor } from './corridor.js'
import { TimeRange } from './timeRange.js'
import { DateRange } from './dateRange.js'

// instantiated once, this is the data store for all spatial data
export class SpatialData {
    #corridors = []
    #timeRanges = []
    #dateRanges = []
    constructor(){}
    get corridors(){ return this.#corridors }
    get timeRanges(){ return this.#timeRanges }
    get dateRanges(){ return this.#dateRanges }
    get activeCorridor(){
        return this.#corridors.find(cor=>cor.isActive)
    }
    createCorridor(){
        let corridor = new Corridor(this)
        this.#corridors.push(corridor)
        corridor.activate()
    }
    createTimeRange(){
        let tr = new TimeRange(this)
        this.#timeRanges.push(tr)
        tr.activate()
    }
    createDateRange(){
        let dr = new DateRange(this)
        this.#dateRanges.push(dr)
        dr.activate()
    }
    get segments(){
        return this.corridors.flatMap( c => c.segments )
    }
    get nodes(){
        return this.segments.flatMap( s => [ s.fromNode, s.toNode ] )
    }
    dropFactor(factor){
        if(factor instanceof DateRange){
            this.#dateRanges = this.#dateRanges.filter(dr => dr != factor)
        }else if(factor instanceof TimeRange){
            this.#timeRanges = this.#timeRanges.filter(tr => tr != factor)
        }else if(factor instanceof Corridor){
            this.#corridors = this.#corridors.filter(c => c != factor)
        }
    }
}
