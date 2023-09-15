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