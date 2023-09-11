import { domain } from './domain.js'

// a node-to-node directed segment
export class Segment {
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