import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Polyline
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
    const { activity, logActivity, data } = useContext(DataContext)
    const corridor = data.activeCorridor
    const map = useMapEvent('click', (event) => { // add an intersection
        if( corridor?.intersections?.length < 2 ){
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
                    corridor.addIntersection(intersection,logActivity)
                    logActivity('added intersection')
                } )
            }
    } )
    
    if(corridor){
        return <>
            {corridor.intersections.map( intersection => (
                <CircleMarker key={intersection.id}
                    center={intersection.latlng}
                    radius={10}
                    color='red'
                >
                    <Popup>
                        <h3>{intersection.description}</h3>
                        <table>
                            <tr><th>Intersection ID</th><td>{intersection.id}</td></tr>
                        </table> 
                    </Popup>
                </CircleMarker>
            ) ) }
            {corridor.links.map( link => {
                return (
                    <Polyline key={link.link_dir} 
                        positions={link.geometry.coordinates.map( ([lng,lat]) => ({lng,lat}) ) }
                        color='red'
                    /> )
            
            } ) }
        </>
    }
    
}