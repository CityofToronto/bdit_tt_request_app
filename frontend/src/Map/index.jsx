import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Polyline
} from 'react-leaflet'
import { useState } from 'react'
import { useMapEvent } from 'react-leaflet/hooks'
import { domain } from '../domain.js'
import { Intersection } from '../intersection.js'
import { Corridor } from '../corridor.js'
import 'leaflet/dist/leaflet.css'

const initialMapCenter = { lat: 43.65344, lng: -79.38400 }

export default function Map() {
    return (
        <MapContainer center={initialMapCenter} zoom={15} style={{height:'100vh'}}>
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'/>
            <DataLayer/>
        </MapContainer>
    )
}

const corridor = new Corridor()

function DataLayer(){
    const [ renderNum, setRenderNum ] = useState(0) // simply forces a rerender when incremented
    const map = useMapEvent('click', (event) => { // add an intersection
        fetch(`${domain}/closest-node/${event.latlng.lng}/${event.latlng.lat}`)
            .then( resp => resp.json() )
            .then( node => {
                const data = node[0]
                const intersection = new Intersection( {
                    id: data.node_id,
                    lat: data.geometry.coordinates[1],
                    lng: data.geometry.coordinates[0],
                    textDescription: data.name
                } )
                return corridor.addIntersection(intersection)
            } )
            .then( () => setRenderNum( i => i + 1 ) )
    } )
    return ( <>
        {corridor.intersections.map( intersection => (
            <CircleMarker key={intersection.id}
                center={intersection.latlng}
                radius={10}
                color='red'
            >
                <Popup>id: {intersection.id}<br/>description: {intersection.description}</Popup>
            </CircleMarker>
        ) ) }
        {corridor.segments.flatMap(seg=>seg.links).map( link => (
            <Polyline key={link.link_dir} 
                positions={link.geometry.coordinates.map( ([lng,lat]) => ({lng,lat}) ) }
                color='red'
            />
        ) )}
    </> )
}