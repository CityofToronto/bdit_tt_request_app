import {CircleMarker, Polyline, LayerGroup} from 'react-leaflet'
import {Map, useMap, Source, Layer} from 'react-map-gl/maplibre'
import { useContext, useState } from 'react'
import { DataContext } from '../Layout'
import { useMapEvent } from 'react-leaflet/hooks'
import { domain } from '../domain.js'
import { Intersection } from '../intersection.js'
import 'leaflet/dist/leaflet.css'

export default function CartoMap(){
    return (
        <Map
            initialViewState={{latitude: 43.65344, longitude: -79.38400, zoom: 14, bearing: -16.5}}
            style={{height:'100vh'}}
            mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=0qLDQrWKpxpwWHjpSoeG"
        >
            <DataLayer/>
            {false && <NodeLayer/>}
        </Map>
    )
}

function DataLayer(){
    const { logActivity, data } = useContext(DataContext)
    const activeCorridor = data.activeCorridor
    const map = useMap()
    map.current.once('click', (event) => { // add an intersection
        if( activeCorridor?.intersections?.length < 2 ){
            fetch(`${domain}/nodes-within/50/${event.lngLat.lng}/${event.lngLat.lat}`)
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
    const corridorsGeojson = {
        type: 'FeatureCollection',
        features: data.corridors.flatMap(c=>c.geojsonFeatures)
    }
    const nodeStyle = {
        id:'corridor-links',
        type:'circle',
        paint:{'circle-radius': 5, 'circle-color': 'red'}
    }
    const lineStyle = {
        id:'corridor-links',
        type:'line',
        paint:{'line-width': 10, 'line-color': 'black'}
    }
    return (
        <Source id='corridor-links' type='geojson'data={corridorsGeojson}>
            <Layer {...nodeStyle}/>
            <Layer {...lineStyle}/>
        </Source>
    )
}

function NodeLayer(){
    // briefly shows locations of nearby clickable nodes on double-click
    const [ nodes, setNodes ] = useState( new Map() )
    useMapEvent('dblclick', (event) => {
        fetch(`${domain}/nodes-within/1000/${event.latlng.lng}/${event.latlng.lat}`)
            .then( resp => resp.json() )
            .then( intersections => {
                setNodes( n => { // add intersections
                    intersections.forEach( i => n.set(i.node_id,i) )
                    return new Map(n)
                } )
                setTimeout( // remove them
                    () => setNodes( n => {
                        intersections.forEach( i => n.delete(i.node_id) )
                        return new Map(n)
                    } ),
                    5000
                )
            } )
    } )
    return (
        <LayerGroup>
            {[...nodes.values()].map( (node,i) => (
                <CircleMarker key={i}
                    center={{lat: node.geometry.coordinates[1], lng: node.geometry.coordinates[0]}}
                    radius={5}
                    pathOptions={{color:'grey'}}
                />
            ) ) }
        </LayerGroup>
    )
}