import { spatialDataInstance as spatialData } from '../../spatialData.js' 


export default function SidebarContent({logActivity}){
    function createCorridor(){
        spatialData.createCorridor()
        console.log(spatialData.activeCorridor)
        logActivity('create corridor')
    }
    return ( <> 
        <h2>Toronto Historic Travel Times</h2>
        <button onClick={createCorridor}>Add a new corridor to the map</button>
    </> )
}