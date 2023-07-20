import { spatialDataInstance as spatialData } from '../../spatialData.js'

import './sidebar.css'

export default function SidebarContent({logActivity}){
    function createCorridor(){
        spatialData.createCorridor()
        console.log(spatialData.activeCorridor)
        logActivity('create corridor')
    }
    return ( <div className="sidebarContent">
        <Welcome/>
        <button onClick={createCorridor}>Add a new corridor to the map</button>
    </div> )
}

function Welcome(){
    return ( <>
        <h2>Toronto Historic Travel Times</h2>
        <p>
            This application allows you to query averaged motor vehicle travel
            times across the city, as far back as 2012. Data come from a small
            sample of probe vehicles that report their location data 
            to <a href="https://www.here.com/">Here</a>. For more information on
            this application and our methodology 
            see <a href="https://github.com/CityofToronto/bdit_tt_request_app">
            the documentation</a>. 
        </p>
    </> )
}