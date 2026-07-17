import { Map as MapGL, useMap, Source, Layer } from 'react-map-gl/maplibre'
import "maplibre-gl/dist/maplibre-gl.css"
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
    useMap().current.on('click', (event) => { // add an intersection
        if( activeCorridor?.intersections?.length < 2 ){
            fetch(`${domain}/nodes-within/50/${event.lngLat.lng}/${event.lngLat.lat}`)
                .then( resp => resp.json() )
                .then(nodes => {
                    if (nodes.length == 0) {
                        console.warn('No nodes found within 50m of click')
                        return
                    }
                    const node = nodes[0]
                    const intersection = new Intersection( {
                        id: node.node_id,
                        lat: node.geometry.coordinates[1],
                        lng: node.geometry.coordinates[0],
                        streetNames: node.street_names
                    } )
                    activeCorridor.addIntersection(intersection, logActivity)
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
                <Layer {...styles.corridors.activeLines}/>
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

const colorLogic = [ 'match', ['get','status'], 'valid', 'green', 'red' ]

const styles = {
    corridors: {
        nodes: {
            id:'corridor-nodes',
            type:'circle',
            paint:{
                'circle-radius': [ 'case', ['get','focus'], 8, 4 ],
                'circle-color': colorLogic,
                'circle-opacity': 0.2,
                'circle-stroke-width': 2,
                'circle-stroke-color': colorLogic
            }
        },
        lines: {
            id:'corridor-links',
            type:'line',
            paint:{
                'line-width': 3,
                'line-color': colorLogic
            },
            layout: {'line-cap': 'round'}
        },
        activeLines: {
            id:'activeCorridor',
            type:'line',
            filter: ['get','focus'],
            paint:{
                'line-width': 20,
                'line-color': colorLogic,
                'line-opacity': 0.1
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
