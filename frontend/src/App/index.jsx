import SidebarContent from "./Sidebar"
import Map from "./Map"

import './layout.css'

export default function Layout(){
    return (
        <div className='layoutContainer'>
            <div className='layoutSidebar'>
                <h2>The sidebar will go here</h2>
                {false && <SidebarContent/>}
            </div>

            <div className='layoutMap'>
                <Map/>
            </div>

            <div className='layoutMapControls'>

            </div>
        </div>
    )
}
