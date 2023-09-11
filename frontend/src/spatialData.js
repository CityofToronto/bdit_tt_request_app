import { Corridor } from './corridor.js'

// instantiated once, this is the data store for all spatial data
export class SpatialData {
    #corridors = []
    constructor(){}
    get corridors(){ return this.#corridors }
    get activeCorridor(){ return this.#corridors[0] }
    createCorridor(){
        this.#corridors.push( new Corridor )
    }
    get segments(){ return this.corridors.flatMap( c => c.segments ) }
    get nodes(){ return this.segments.flatMap( s => [ s.fromNode, s.toNode ] ) }
}
