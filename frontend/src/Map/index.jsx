import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Polyline,
    LayerGroup
} from 'react-leaflet'
import { useContext } from 'react'
import { DataContext } from '../Layout'
import { useMapEvent } from 'react-leaflet/hooks'
import { domain } from '../domain.js'
import { Intersection } from '../intersection.js'
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

function DataLayer(){
    const { logActivity, data } = useContext(DataContext)
    const activeCorridor = data.activeCorridor
    useMapEvent('click', (event) => { // add an intersection
        if( activeCorridor?.intersections?.length < 2 ){
            fetch(`${domain}/closest-node/${event.latlng.lng}/${event.latlng.lat}`)
                .then( resp => resp.json() )
                .then( node => {
                    const data = node[0]
                    const intersection = new Intersection( {
                        id: data.node_id,
                        lat: data.geometry.coordinates[1],
                        lng: data.geometry.coordinates[0],
                        streetNames: data.street_names
                    } )
                    activeCorridor.addIntersection(intersection,logActivity)
                    logActivity('added intersection')
                } )
            }
    } )
    return data.corridors.filter( c => c.isComplete || c.isActive ).map( (corridor,i) => {
        // red: active not complete; green: active complete: grey: inactive
        const color = corridor.isActive ? corridor.isComplete ? 'green' : 'red' : '#0005'
        return (
            <LayerGroup key={i}>
                {corridor.intersections.map( intersection => (
                    <CircleMarker key={intersection.id}
                        center={intersection.latlng}
                        radius={10}
                        pathOptions={{color}}
                    >
                        {corridor.isActive && <Popup>
                            <h3>{intersection.description}</h3>
                            <table>
                                <tbody>
                                    <tr><th>Intersection ID</th><td>{intersection.id}</td></tr>
                                </tbody>
                            </table> 
                        </Popup>}
                    </CircleMarker>
                ) ) }
                {corridor.links.map( link => {
                    return (
                        <Polyline key={link.link_dir} 
                            positions={link.geometry.coordinates.map( ([lng,lat]) => ({lng,lat}) ) }
                            pathOptions={{color}}
                        />
                    )
                } ) }
            </LayerGroup>
        )
    } )
}