export class Intersection {
    #id
    #lat
    #lng
    #streetNames
    constructor({id,lat,lng,streetNames}){
        this.#id = id
        this.#lat = lat
        this.#lng = lng
        this.#streetNames = new Set(streetNames)
    }
    get id(){ return this.#id }
    get latlng(){ return { lat: this.#lat, lng: this.#lng } }
    get description(){
        return [...this.#streetNames].join(' & ')
    }
    get streetNames(){ return this.#streetNames }
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