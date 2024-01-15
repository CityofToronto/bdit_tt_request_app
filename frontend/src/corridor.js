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
    get name(){
        if(this.#intersections.length == 1){
            return `Incomplete corridor starting from ${this.intersections[0].description}`
        }else if(this.#intersections.length == 2 && this.viaStreets.size > 0){
            // routing should be done
            let start = difference(this.intersections[0].streetNames,this.viaStreets)
            let end = difference(this.intersections[1].streetNames,this.viaStreets)
            if(start.size == 0){
                start.add(this.intersections[0].displayCoords)
            }
            if(end.size == 0){
                end.add(this.intersections[1].displayCoords)
            }
            return `${[...start].join(' & ')} to ${[...end].join(' & ')} via ${[...this.viaStreets].join(' & ')}`
        }else if(this.#intersections.length == 2){ // but no via streets (yet?)
            let start = [...this.intersections[0].streetNames].join(' & ')
            let end = [...this.intersections[1].streetNames].join(' & ')
            return `from ${start} to ${end}`
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
            <div className='corridorName'>{corridor.name}</div>
            {corridor.isActive && <>
                <div className='instructions'>
                    {corridor.intersections.length == 0 &&
                        <>Click on the map to identify the starting point</>
                    }
                    {corridor.intersections.length == 1 &&
                        <>Click on the map to identify the end point</>
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