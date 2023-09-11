import { Intersection } from './intersection.js'
import { Segment } from './segment.js'

// a sequence of segments forming a coherent corridor
export class Corridor {
    #isActive // corridor is currently focused by user
    #dataContext // SpatialData manages corridors
    #intersections = []
    #segments = []
    #name = 'unnamed corridor'
    constructor(dataContext){
        this.#dataContext = dataContext
        //this.activate()
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
    get name(){ return this.#name }
}