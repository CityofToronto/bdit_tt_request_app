import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { icon } from 'leaflet'
import standardIcon from 'leaflet/dist/images/marker-icon.png'
import standardIconShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

const defaultIcon = icon({
    iconUrl: standardIcon,
    shadowUrl: standardIconShadow
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

import { useMapEvent } from 'react-leaflet/hooks'

function DataLayer(){
    // I bet with a ref, I can compare to the event target to see what was clicked
    const map = useMapEvent('click', (event) => {
        console.log(event)
    } )
}