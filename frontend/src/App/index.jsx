import { useState } from 'react'
import SidebarContent from "./Sidebar"
import Map from "./Map"

import { SpatialData } from '../spatialData.js'
import './layout.css'

export default function Layout(){
    const [ spatialData, setSpatialData ] = useState( new SpatialData() )
    return (
        <div className='layoutContainer'>
            <div className='layoutSidebar'>
                <h2>The sidebar will go here</h2>
                {false && <SidebarContent/>}
            </div>

            <div className='layoutMap'>
                <Map
                    spatialData={spatialData}
                />
            </div>

            <div className='layoutMapControls'>

            </div>
        </div>
    )
}
