import { useContext } from 'react'
import { DataContext } from '../Layout'

export function CorridorsContainer(){
    const { logActivity, data } = useContext(DataContext)
    function addACorridor(){
        data.createCorridor()
        logActivity('new corridor')
    }
    return (
        <div className='panelContainer'>
            <div className='bigButton' onClick={addACorridor}>Create a new corridor</div>
            <div className='corridor-list'>
                {data.corridors.map( (c,i) => (
                    <Corridor key={i} corridor={c}/>
                ) ) }
            </div>
        </div>
    )
}

function Corridor({corridor}){
    const { logActivity } = useContext(DataContext)
    return (
        <div className={`corridor ${corridor.isActive ? 'active' : 'inactive'}`}
            onClick={()=>{
                if(!corridor.isActive){
                    corridor.activate()
                    logActivity('focus corridor')
                }
            } }
        >
            <div className='corridorName'>{corridor.name}</div>
            {corridor.isActive && <>
                <div className='instructions'>
                    {corridor.intersections.length == 0 &&
                        <>Click on the map to identify the starting point</>
                    }
                    {corridor.intersections.length == 1 &&
                        <>Click on the map to identify the end point</>
                    }
                </div>
            </> }
        </div>
    )
}