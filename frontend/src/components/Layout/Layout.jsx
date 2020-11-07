import React from "react";
import Dropdown from "react-dropdown";
import Sidebar from "react-sidebar";
import SidebarContent from "./SidebarContent";
import Mapbox from "../Map/Mapbox";
import {getLinksBetweenNodes} from "../../actions/actions";

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
        if(newNodes.length > 0){
            console.log(newNodes[0])
        }
        this.setState({ nodesList: newNodes })
    }

    updateLinks = (newLinks) => {
        console.log(newLinks)
        this.setState({ linksList: newLinks })
    }

    getLinks = (doc) => {
        getLinksBetweenNodes(doc, this.state.nodesList)
    }

    render(){
        // let nodeIds = [];
        // this.state.nodesList.forEach((node) => {
        //     nodeIds.push(node.nodeId);
        // });
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
                {/*<Dropdown*/}
                {/*    options={nodeIds}*/}
                {/*    className={"dropdown"}*/}
                {/*/>*/}
                <Mapbox
                    onLinkUpdate={this.updateLinks}
                    onNodeUpdate={this.updateNodes}
                    getLinks={this.getLinks}
                />
            </div>
        );

    }
}

export default Layout;
