import { useState } from 'react'
import SidebarContent from "./Sidebar"
import Map from "./Map"

import './layout.css'

export default function Layout(){
    // state variable for forcing a rerender when necessary, 
    // but also tracking user inputs which may be useful for debugging
    // is just an array of strings
    const [ activityLog, setActivityLog ] = useState([])
    function logActivity(activityDescription){
        console.log(activityDescription)
        setActivityLog( [ ...activityLog, activityDescription ] )
    }
    return (
        <div className='layoutContainer'>
            <div className='layoutSidebar'>
                <SidebarContent logActivity={logActivity}/>
            </div>

            <div className='layoutMap'>
                <Map/>
            </div>
        </div>
    )
}
