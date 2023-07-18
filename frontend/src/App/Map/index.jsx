import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { icon } from 'leaflet'
import standardIcon from 'leaflet/dist/images/marker-icon.png'
import standardIconShadow from 'leaflet/dist/images/marker-shadow.png'
import circleIcon from './icon.svg'
import 'leaflet/dist/leaflet.css'

const defaultIcon = icon({ // this is not actually centered on the given point
    iconUrl: circleIcon,
    iconAnchor: [15, 15],
    iconSize:[30,30]
})

const center = { lat: 43.65720, lng: -79.34299 }

export default function Map() {
    return (
        <MapContainer center={center} zoom={15} style={{height: '100vh'}}>
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'/>
            <Marker position={center} icon={defaultIcon}/>
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
    return points.map( (point,i) => <Marker key={i} position={point} icon={defaultIcon}/> )
}