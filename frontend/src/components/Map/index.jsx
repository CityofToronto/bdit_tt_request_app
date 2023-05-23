import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import SpatialData from '../../SpatialData.js'
import 'leaflet/dist/leaflet.css'

const init_center = [43.65720,-79.34299]
const init_zoom = 15

export default function Map(){
    return (
        <MapContainer 
            center={init_center}
            zoom={init_zoom}
            style={{height:'100vh',width:'100%',zIndex:0}}
            zoomControl={false}
        >
            <ZoomControl position='topright'/>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={init_center}>
                <Popup>
                    hello world
                </Popup>
            </Marker>
        </MapContainer>
    )
}