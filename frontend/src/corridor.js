import { Factor } from './factor.js'
import { Intersection } from './intersection.js'
import { Segment } from './segment.js'

// a sequence of segments forming a coherent corridor
export class Corridor extends Factor {
    #intersections = []
    #segments = []
    constructor(dataContext){
        super(dataContext)
    }
    get isComplete(){
        return this.intersections.length > 1 && this.links.length > 0
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
        return new Set( this.links.map( link => link.name ) )
    }
    get viaStreetsString(){
        return [...this.viaStreets].join(' & ')
    }
    get startCrossStreets(){
        try { return difference(this.#intersections[0].streetNames,this.viaStreets) }
        catch (e) { return new Set() }
    }
    get startCrossStreetsString(){
        if(this.startCrossStreets.size > 0){
            return [...this.startCrossStreets].join(' & ')
        }else if(this.#intersections.length > 0){
            return this.#intersections[0].displayCoords
        }
        return ''
    }
    get endCrossStreets(){
        try { return difference(this.#intersections[1].streetNames,this.viaStreets) }
        catch (e) { return new Set() }
    }
    get endCrossStreetsString(){
        if(this.endCrossStreets.size > 0){
            return [...this.endCrossStreets].join(' & ')
        }else if(this.#intersections.length > 1){
            return this.#intersections[1].displayCoords
        }
        return ''
    }
    get name(){
        if(this.#intersections.length == 1){
            return `Incomplete corridor starting from ${this.startCrossStreetsString}`
        }else if(this.#intersections.length == 2 && this.viaStreets.size > 0){
            return `${this.viaStreetsString} from ${this.startCrossStreetsString} to ${this.endCrossStreetsString}`
        }else if(this.#intersections.length == 2){ // but no via streets (yet?)
            return `from ${this.startCrossStreetsString} to ${this.endCrossStreetsString}`
        }
        return 'New Corridor'
    }
    render(){
        return <CorridorElement corridor={this}/>
    }
}

function CorridorElement({corridor}){
    return (
        <div>
            <div className='corridorName'>
                {corridor.name}
            </div>
            {corridor.isActive && <>
                <div className='instructions'>
                    {corridor.intersections.length == 0 &&
                        'Click on the map to identify the starting point'
                    }
                    {corridor.intersections.length == 1 &&
                        'Click on the map to identify the end point'
                    }
                </div>
            </> } 
        </div>
    )
}

// return values of A not in B
function difference(setA, setB) {
    let setDiff = new Set(setA)
    for (const elem of setB) {
        setDiff.delete(elem)
    }
    return setDiff 
}