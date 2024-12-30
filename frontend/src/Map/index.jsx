import { Map as MapGL, useMap, Source, Layer } from 'react-map-gl/maplibre'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../Layout'
import { domain } from '../domain.js'
import { Intersection } from '../intersection.js'

export default function CartoMap(){
    return (
        <MapGL
            initialViewState={{latitude: 43.65344, longitude: -79.38400, zoom: 14, bearing: -16.5}}
            style={{height:'100vh'}}
            mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=0qLDQrWKpxpwWHjpSoeG"
            doubleClickZoom={false}
        >
            <DataLayer/>
            <NodeLayer/>
        </MapGL>
    )
}

function DataLayer(){
    const { logActivity, data } = useContext(DataContext)
    const activeCorridor = data.activeCorridor
    useMap().current.once('click', (event) => { // add an intersection
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
    const corridorsGeojsonLinear = {
        type: 'FeatureCollection',
        features: data.corridors.flatMap(c=>c.geojsonFeaturesLinear)
    }
    const corridorsGeojsonPoint = {
        type: 'FeatureCollection',
        features: data.corridors.flatMap(c=>c.geojsonFeaturesPoint)
    }
    return (
        <>
            <Source id='corridor-links' type='geojson'data={corridorsGeojsonLinear}>
                <Layer {...styles.corridors.lines}/>
            </Source>
            <Source id='corridor-nodes' type='geojson'data={corridorsGeojsonPoint}>
                <Layer {...styles.corridors.nodes}/>
            </Source>
        </>
    )
}

function NodeLayer(){
    // briefly shows locations of nearby clickable nodes on double-click
    const [ nodes, setNodes ] = useState( new Map() )
    const map = useMap()
    useEffect(()=>{
        map.current.on('dblclick', event => {
            fetch(`${domain}/nodes-within/1000/${event.lngLat.lng}/${event.lngLat.lat}`)
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
        })
    },[])
    const nodesGeoJSON = {
        type: 'FeatureCollection',
        features: [...nodes.values()].map( node => ({
            type: 'Feature',
            geometry: node.geometry
        }) )
    }
    return (
        <Source id='nodes' type='geojson'data={nodesGeoJSON}>
            <Layer {...styles.nodes}/>
        </Source>
    )
}

const styles = {
    corridors: {
        nodes: {
            id:'corridor-nodes',
            type:'circle',
            paint:{
                'circle-radius': 8, 
                'circle-color': ['get','color'],
                'circle-opacity': 0.2,
                'circle-stroke-width': 2,
                'circle-stroke-color': ['get','color']
            }
        },
        lines: {
            id:'corridor-links',
            type:'line',
            paint:{
                'line-width': 3,
                'line-color': ['get','color']
            },
            layout: {'line-cap': 'round'}
        }
    },
    nodes: {
        id:'nodes',
        type:'circle',
        paint:{
            'circle-radius': 3, 
            'circle-color': 'grey',
            'circle-opacity': 0.5,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'grey'
        }
    }
}
