import { Intersection } from './intersection.js'
import { Segment } from './segment.js'

// a sequence of segments forming a coherent corridor
export class Corridor {
    #isActive // corridor is currently focused by user
    #dataContext // SpatialData manages corridors
    #intersections = []
    #segments = []
    constructor(dataContext){
        // make this corridor aware of all other corridors
        this.#dataContext = dataContext
    }
    get isActive(){ return this.#isActive }
    activate(){
        this.#isActive = true
        this.#dataContext.corridors.forEach( cor => {
            if(cor != this) cor.deactivate()
        } )
    }
    deactivate(){
        this.#isActive = false
    }
    addIntersection(intersection,logActivity){
        console.assert(intersection instanceof Intersection)
        this.#intersections = [ ...this.#intersections, intersection ]
        this.#segments = this.#intersections
            .map( (int,i,ints) => {
                if (i > 0){
                    return new Segment( {
                        from: ints[i-1],
                        to: int
                    } )
                }
            } )
            .filter( v => v )
        Promise.all( this.#segments.map( seg => seg.fetchLinks() ) )
            .then( () => {
                // notify the layout that the path is ready to be rendered
                logActivity('shortest path returned')
            } )
    }
    get intersections(){ return this.#intersections }
    addSegment(segment){
        if(segment instanceof Segment){
            this.#segments.push(segment)
        }
    }
    get segments(){ return this.#segments }
    get links(){ return this.segments.flatMap( seg => seg.links ) }
    get viaStreets(){
        let names = new Set( this.links.map( link => link.name ) )
        return [...names]
    }
    get name(){
        if(this.#intersections.length == 1){
            return `Incomplete corridor starting from ${this.intersections[0].description}`
        }else if(this.#intersections.length == 2){
            let [a,b] = this.intersections
            return `Corridor from ${a.description} to ${b.description} via ${this.viaStreets.join(' & ')}`
        }
        return 'New Corridor'
    }
}