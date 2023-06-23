import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <Marker position={center} icon={defaultIcon}>
            <Popup>
                A pretty CSS3 popup. <br/> Easily customizable.
            </Popup>
            </Marker>
        </MapContainer>
    )
}