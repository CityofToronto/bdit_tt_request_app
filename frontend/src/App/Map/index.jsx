import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
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

function DataLayer(){
    const [ points, setPoints ] = useState([])
    const map = useMapEvent('click', (event) => {
        fetch(`${domain}/closest-node/${event.latlng.lng}/${event.latlng.lat}`)
            .then( resp => resp.json() )
            .then( node => {
                const [ lng, lat ] = node[0].geometry.coordinates
                setPoints( points => [ ...points, { lat, lng } ] )
            } )
    } )
    return points.map( (point,i) => (
        <CircleMarker key={i}
            center={point}
            radius={10}
            color='red'
        />
    ) )
}