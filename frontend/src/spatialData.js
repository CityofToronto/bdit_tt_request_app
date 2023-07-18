// instantiated once, this is the data store for all spatial data
class SpatialData {
    #corridors
    constructor(){
        this.#corridors = [ new Corridor() ]
    }
    get corridors(){ return this.#corridors }
    addCorridor(corridor){
        if(corridor instanceof Corridor){
            this.#corridors.push(corridor)
        }
    }
    get segments(){ return this.corridors.flatMap( c => c.segments ) }
    get nodes(){ return this.segments.flatMap( s => [ s.fromNode, s.toNode ] ) }
}

// a sequence of segments forming a coherent corridor
class Corridor {
    #segments
    constructor(){
        this.#segments = []
    }
    addSegment(segment){
        if(segment instanceof Segment){
            this.#segments.push(segment)
        }
    }
    get segments(){ return this.#segments }
}

// a node-to-node directed segment
class Segment {
    #fromIntersection
    #toIntersection
    #links
    constructor({fromIntersection,toIntersection}){
        console.assert(fromNode instanceof Intersection)
        console.assert(toNode instanceof Intersection)
        this.#fromIntersection = fromIntersection
        this.#toIntersection = toIntersection
    }
    get fromIntersection(){ return this.#fromIntersection }
    get toIntersection(){ return this.#toIntersection }
    defineLinks(links){
        // TODO 
        this.#links = links
    }
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

export const spatialDataInstance = new SpatialData()