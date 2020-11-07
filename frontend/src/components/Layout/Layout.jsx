import React from "react";
import Dropdown from "react-dropdown";
import Sidebar from "react-sidebar";
import SidebarContent from "./SidebarContent";
import Mapbox from "../Map/Mapbox";

class Layout extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            sidebarOpen: true,
            nodesList: [],
            linksList: []
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this)
    }

    onSetSidebarOpen(open){
        this.setState({ sidebarOpen: open });
    }

    updateNodes = (newNodes) => {
        console.log(newNodes)
        this.setState({ nodesList: newNodes })
    }

    updateLinks = (newLinks) => {
        console.log(newLinks)
        this.setState({ linksList: newLinks })
    }

    render(){

        return (
            <div id={"header"} style={{color: "black"}}>
                <Sidebar
                    sidebar={<SidebarContent/>}
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
                <Dropdown
                    options={[this.state.nodesList, this.state.linksList]}
                    value={this.state.nodesList}
                    placeholder={this.state.nodesList}
                    className={"dropdown"}
                />
                <Mapbox
                    onLinkUpdate={this.updateLinks}
                    onNodeUpdate={this.updateNodes}
                />
            </div>
        );

    }
}

export default Layout;
