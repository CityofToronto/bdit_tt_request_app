import { Factor } from './factor.js'
import { Intersection } from './intersection.js'
import { Segment } from './segment.js'
import { domain } from './domain.js'

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
    get fromIntersection(){
        let from = this.intersections.length > 0 ? this.intersections[0] : undefined
        return from
    }
    get toIntersection(){
        let to = this.intersections.length > 1 ? this.intersections[1] : undefined
        return to
    }
    get URI(){
        if( ! this.isComplete ) return undefined
        let [start, end] = [...this.#intersections.values().map(i => i.id)]
        return `${domain}/link-nodes/here/${start}/${end}`
    }
    get routeIsValid(){
        if(this.links.length == 0) return false;
        // need to assert that there are no gaps in the route
        return this.links.every( (link, i, links) => {
            if(i == 0) return true
            return link.source == links[i-1].target
        } )
    }
    get geojsonFeaturesLinear(){
        return {
            type: 'Feature',
            geometry: {
                type: 'MultiLineString',
                coordinates: this.links.map(link=>link.geometry.coordinates)
            },
            properties: {
                URI: this.URI,
                fromNode: this.fromIntersection?.id,
                toNode: this.toIntersection?.id,
                routeStreets: this.viaStreetsString,
                direction: this.bearing,
                startCrossStreets: this.startCrossStreetsString,
                endCrossStreets: this.endCrossStreetsString,
                status: this.isComplete ? 'valid' : ''             }
        }
    }
    get geojsonFeaturesPoint(){
        return this.intersections.map( i => {
            let feature = i.geojson
            feature.properties.status = this.isComplete ? 'valid' : ''
            return feature
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
        if( ! this.fromIntersection ) return new Set()
        return difference(this.fromIntersection.streetNames,this.viaStreets)
    }
    get startCrossStreetsString(){
        if(this.startCrossStreets.size > 0){
            return [...this.startCrossStreets].join(' & ')
        }else if(this.fromIntersection){
            return this.fromIntersection.displayCoords
        }
        return ''
    }
    get endCrossStreets(){
        if( ! this.toIntersection ) return new Set()
        return difference(this.toIntersection.streetNames,this.viaStreets)
    }
    get endCrossStreetsString(){
        if(this.endCrossStreets.size > 0){
            return [...this.endCrossStreets].join(' & ')
        }else if(this.toIntersection){
            return this.toIntersection.displayCoords
        }
        return ''
    }
    get bearing(){
        // azimuth calculation borrowed from:
        // http://www.movable-type.co.uk/scripts/latlong.html
        const A = this.fromIntersection
        const B = this.toIntersection
        if( ! (A && B) ) return undefined;
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