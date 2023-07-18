import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
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

import { useState } from 'react'
import { useMapEvent } from 'react-leaflet/hooks'
import { domain } from '../../actions.js'
import { Intersection } from '../../spatialData.js'

function DataLayer(){
    const [ intersections, setIntersections ] = useState([])
    const map = useMapEvent('click', (event) => {
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
                setIntersections( intersections => [ ...intersections, intersection ] )
            } )
    } )
    console.log(intersections)
    return intersections.map( intersection => (
        <CircleMarker key={intersection.id}
            center={intersection.latlng}
            radius={10}
            color='red'
        >
            <Popup>id: {intersection.id}<br/>description: {intersection.description}</Popup>
        </CircleMarker>
    ) )
}