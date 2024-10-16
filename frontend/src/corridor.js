import { Factor } from './factor.js'
import { Intersection } from './intersection.js'
import { Segment } from './segment.js'

// a sequence of segments forming a coherent corridor
export class Corridor extends Factor {
    #intersections = new Map() // disallows duplicates
    #segments = []
    constructor(dataContext){
        super(dataContext)
    }
    get isComplete(){
        return this.intersections.length > 1 && this.routeIsValid
    }
    get routeIsValid(){
        if(this.links.length == 0) return false;
        // need to assert that there are no gaps in the route
        return this.links.every( (link, i, links) => {
            if(i == 0) return true
            return link.source == links[i-1].target
        } )
    }
    addIntersection(intersection,logActivity){
        console.assert(intersection instanceof Intersection)
        this.#intersections.set(intersection.id, intersection)
        this.#segments = this.intersections
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
                this.hasUpdated()
            } )
    }
    get intersections(){ return [...this.#intersections.values()] }
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
        try { return difference(this.intersections[0].streetNames,this.viaStreets) }
        catch (e) { return new Set() }
    }
    get startCrossStreetsString(){
        if(this.startCrossStreets.size > 0){
            return [...this.startCrossStreets].join(' & ')
        }else if(this.#intersections.size > 0){
            return this.intersections[0].displayCoords
        }
        return ''
    }
    get endCrossStreets(){
        try { return difference(this.intersections[1].streetNames,this.viaStreets) }
        catch (e) { return new Set() }
    }
    get endCrossStreetsString(){
        if(this.endCrossStreets.size > 0){
            return [...this.endCrossStreets].join(' & ')
        }else if(this.#intersections.size > 1){
            return this.intersections[1].displayCoords
        }
        return ''
    }
    get bearing(){
        // azimuth calculation borrowed from:
        // http://www.movable-type.co.uk/scripts/latlong.html
        if( ! this.#intersections.size == 2 ) return undefined;
        const [A, B] = this.intersections
        const x = Math.cos(d2r(A.lat)) * Math.sin(d2r(B.lat))
            - Math.sin(d2r(A.lat)) * Math.cos(d2r(B.lat)) * Math.cos(d2r(B.lng - A.lng))
        const y = Math.sin(d2r(B.lng - A.lng)) * Math.cos(d2r(B.lat))
        // degrees from true East TODO: adjust this by 17 degrees
        const azimuth = r2d(Math.atan2(x,y))
        const compass = { NE: 45, SE: -45, SW: -135, NW: 135 }
        if( azimuth < compass.NE && azimuth > compass.SE ) return 'Eastbound'
        if( azimuth > compass.NE && azimuth < compass.NW ) return 'Northbound'
        if( azimuth < compass.SE && azimuth > compass.SW ) return 'Southbound'
        if( azimuth > compass.NW || azimuth < compass.SW ) return 'Westbound'
        return ''
    }
    get name(){
        if(this.#intersections.size == 1){
            return `Incomplete corridor starting from ${this.startCrossStreetsString}`
        }else if(this.#intersections.size == 2 && this.viaStreets.size > 0){
            return `${this.viaStreetsString} ${this.bearing.toLowerCase()} from ${this.startCrossStreetsString} to ${this.endCrossStreetsString}`
        }else if(this.#intersections.size == 2){ // but no via streets (yet?)
            return `${this.bearing.toLowerCase()} from ${this.startCrossStreetsString} to ${this.endCrossStreetsString}`
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

// convert between degrees and radians
function d2r(degrees) { return degrees * (Math.PI / 180) }
function r2d(rad) { return rad / (Math.PI / 180) }