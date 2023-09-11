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

// a sequence of segments forming a coherent corridor
export class Corridor {
    #intersections = []
    #segments = []
    #name = 'Give me a name!'
    constructor(){}
    addIntersection(intersection){
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
        return Promise.all( this.#segments.map( seg => seg.fetchLinks() ) )
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

import { domain } from './actions.js'

// a node-to-node directed segment
class Segment {
    #fromIntersection
    #toIntersection
    #links = []
    constructor({from,to}){
        console.assert(from instanceof Intersection)
        console.assert(to instanceof Intersection)
        this.#fromIntersection = from
        this.#toIntersection = to
    }
    get fromIntersection(){ return this.#fromIntersection }
    get toIntersection(){ return this.#toIntersection }
    fetchLinks(links){
        return fetch(`${domain}/link-nodes/${this.#fromIntersection.id}/${this.toIntersection.id}`)
            .then( resp => resp.json() )
            .then( ({links}) => {
                this.#links = links
                return true
            } )   
    }
    get links(){ return this.#links }
    get geom(){
        return this.links.length == 0 ? null : {
            type: 'FeatureCollection'
            // TODO etc
        }
    }
}

export class Intersection {
    #id
    #lat
    #lng
    #textDescription
    constructor({id,lat,lng,textDescription}){
        this.#id = id
        this.#lat = lat
        this.#lng = lng
        this.#textDescription = textDescription
    }
    get id(){ return this.#id }
    get latlng(){ return { lat: this.#lat, lng: this.#lng } }
    get description(){ return this.#textDescription }
    get geojson(){
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [ this.#lng, this.#lat ]
            },
            properties: {
                id: this.#id
            }
        }
    }
}