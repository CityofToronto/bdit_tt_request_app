import { useContext } from 'react'
import { DataContext } from './Layout'

export class TimeRange {
    #isActive // is currently focused by user
    #dataContext // SpatialData manages this
    constructor(dataContext){
        // make this one aware of all others
        this.#dataContext = dataContext
    }
    get isActive(){ return this.#isActive }
    activate(){
        this.#isActive = true
        this.#dataContext.timeRanges.forEach( tr => {
            if(tr != this) tr.deactivate()
        } )
    }
    get isComplete(){
        return false // TODO
    }
    deactivate(){
        this.#isActive = false
    }
    get name(){
        return 'New Time Range'
    }
    render(){
        return <TimeRangeElement timeRange={this}/>
    }
}

function TimeRangeElement({timeRange}){
    const { logActivity } = useContext(DataContext)
    return (
        <div onClick={()=>{
                if(!timeRange.isActive){
                    timeRange.activate()
                    logActivity('focus time range')
                }
            } }
        >
            <div className='timeRangeName'>{timeRange.name}</div>
            {timeRange.isActive && <>
                <div className='instructions'>
                    dunno
                </div>
            </> }
        </div>
    )
}