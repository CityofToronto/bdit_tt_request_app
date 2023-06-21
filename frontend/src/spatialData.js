// instantiated once, this is the data store for all spatial data
class SpatialData {
    #corridors
    constructor(){
        this.#corridors = []
    }
    get corridors(){ return this.#corridors }
    addCorridor(corridor){
        if(corridor instanceof Corridor){
            this.#corridors.push(corridor)
        }
    }
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
}

// a node-to-node directed segment
class Segment {
    #fromNode
    #toNode
    #links
    constructor({fromNode,toNode}){
        console.assert(fromNode instanceof Node)
        console.assert(toNode instanceof Node)
        this.#fromNode = fromNode
        this.#toNode = toNode
    }
    get fromNode(){ return this.#fromNode }
    get toNode(){ return this.#toNode }
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

class Node {
    #id
    #lat
    #lon
    constructor({id,lat,lon}){
        this.#id = id
        this.#lat = lat
        this.#lon = lon
    }
    get id(){ return this.#id }
    get geojson(){
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [this.#lon, this.#lat]
            },
            properties: { id: this.#id }
        }
    }
}

export default new SpatialData()