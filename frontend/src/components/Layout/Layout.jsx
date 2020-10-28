import React from "react";
import MapElement from "./Map";
import Sidebar from "react-sidebar";

class Layout extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            sidebarOpen: true
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this)
    }

    onSetSidebarOpen(open){
        this.setState({ sidebarOpen: open });
    }

    render(){

        return (
            <div id={"header"} style={{color: "black"}}>
                <Sidebar
                    sidebar={<h1>This is the content on the sidebar</h1>}
                    open={this.state.sidebarOpen}
                    onSetOpen={this.onSetSidebarOpen}
                    styles={{sidebar: {background: "white", width: 300}}}
                >
                    <button
                        onClick={()=> this.onSetSidebarOpen(true)}
                        style={{position: "absolute", right: "5%", height: "40px", width: "10%", top: "5px"}}
                    >
                        Open Sidebar
                    </button>
                </Sidebar>
                <MapElement/>
            </div>
        );

    }
}

export default Layout;
