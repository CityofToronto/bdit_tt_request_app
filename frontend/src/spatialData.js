import { Corridor } from './corridor.js'
import { TimeRange } from './timeRange.js'

// instantiated once, this is the data store for all spatial data
export class SpatialData {
    #corridors = []
    #timeRanges = []
    constructor(){}
    get corridors(){
        return this.#corridors
    }
    get timeRanges(){
        return this.#timeRanges
    }
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
    get segments(){
        return this.corridors.flatMap( c => c.segments )
    }
    get nodes(){
        return this.segments.flatMap( s => [ s.fromNode, s.toNode ] )
    }
}
