import { Component, createContext } from 'react'
import { SpatialData } from '../spatialData.js'
import SidebarContent from "./Sidebar"
import Map from "./Map"

import './layout.css'

export const DataContext = createContext({})

export default class Layout extends Component {
    constructor(props){
        super(props)
        this.logActivity =  this.logActivity.bind(this)
        this.state = {
            data: new SpatialData(),
            log: [],
            logActivity: this.logActivity
        }
    }
    logActivity(activity){
        this.setState({
            log: [ ...this.state.log, activity ]
        })
    }
    render(){
        return (
            <DataContext.Provider value={this.state}>
                <div className='layoutContainer'>
                    <div className='layoutSidebar'>
                        <SidebarContent/>
                    </div>
                    <div className='layoutMap'>
                        <Map/>
                    </div>
                </div>
            </DataContext.Provider>
        )
    }
}
