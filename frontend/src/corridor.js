import { Factor } from './factor.js'
import { Intersection } from './intersection.js'
import { Segment } from './segment.js'

import { useContext } from 'react'
import { DataContext } from './Layout'

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
        let names = new Set( this.links.map( link => link.name ) )
        return [...names]
    }
    get name(){
        if(this.#intersections.length == 1){
            return `Incomplete corridor starting from ${this.intersections[0].description}`
        }else if(this.#intersections.length == 2){
            let [a,b] = this.intersections
            return `${a.description} to ${b.description} via ${this.viaStreets.join(' & ')}`
        }
        return 'New Corridor'
    }
    render(){
        return <CorridorElement corridor={this}/>
    }
}

function CorridorElement({corridor}){
    const { logActivity } = useContext(DataContext)
    return (
        <div
            onClick={()=>{
                if(!corridor.isActive){
                    corridor.activate()
                    logActivity('focus corridor')
                }
            } }
        >
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