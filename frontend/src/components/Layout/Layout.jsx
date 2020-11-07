import React from "react";
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
            linksList: [],
            timeRange: "",
            dateRange: "",
            dayRange: "",
            includeHolidays: false
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

    handleHolidays = () =>{
        this.setState({ includeHolidays: !this.state.includeHolidays })
    }

    updatePreset = (event) => {
        console.log(event);
        switch(event.value){
            case "Working Week":
                this.setState({ timeRange: "0600:0900", dayRange: "mon:fri", includeHolidays: false });
                break;

            default:
                this.setState({ timeRange: "", dayRange: "", includeHolidays: false })
        }
    }

    updateDates = (e) => {
        this.setState({dateRange: e.target.value})
    }

    updateTimes = (e) => {
        this.setState({timeRange: e.target.value})
    }

    updateDays = (e) => {
        this.setState({dayRange: e.target.value})
    }

    downloadData = () => {
        let params = this.parseData()
    }

    parseData(){

        let params = {};
        let times = this.state.timeRange.split(":");
        let days = this.state.dayRange.split(":");
        const validDays = ["sun", "mon", "tues", "wed", "thurs", "fri", "sat"];
        let dates = this.state.dateRange.split(":");

        // First validate the times
        if(!(times.length === 2 && times[0].length === 4 && times[1].length === 4 &&
            parseInt(times[0]) < 2400 && parseInt(times[1]) < 2400 &&
            parseInt(times[0]) < parseInt(times[1]))){

            alert("Please enter a time range following the format: hhmm:hhmm")

            // next validate the days
        } else if(!(days.length === 2 && validDays.includes(days[0].toLowerCase()) &&
            validDays.includes(days[1].toLowerCase()) &&
            validDays.indexOf(days[0].toLowerCase()) <= validDays.indexOf(days[1].toLowerCase()))){

            alert("Please enter a day range following the format: start:end")

            // finally validate the dates
        } else if(!(dates.length === 2 && this.validDate(dates[0]) && this.validDate(dates[1]) &&
            parseInt(dates[0].replaceAll("-", "")) <=
            parseInt(dates[1].replaceAll("-", "")))){

            alert("Please enter a date range following the format: yyyy-mm-dd:yyyy-mm-dd");

            // everything is valid so parse the data
        } else {
            params = {
                startTimeStamp: dates[0] + " " + times[0],
                endTimeStamp:dates[1] + " " + times[1],
                startDay: days[0],
                endDay: days[1]
            }
        }
        return params;
    }

    validDate(dateString){
        let segments = dateString.split("-");
        if(segments.length === 3 && this.strIsInt(segments[0]) && segments[0].length === 4 &&
            this.strIsInt(segments[1]) && segments[1].length === 2 &&
            this.strIsInt(segments[2]) && segments[2].length === 2){
            return true;
        } else {
            console.log(segments.length);
            return false;
        }
    }

    // From stack overflow
    strIsInt(str){
        str = str.replace(/^0+/, "") || "0";
        let n = Math.floor(Number(str));
        return n !== Infinity && String(n) === str && n >= 0;
    }

    render(){
        return (
            <div id={"header"} style={{color: "black"}}>
                <Sidebar
                    sidebar={<SidebarContent
                        onHolidayUpdate={this.handleHolidays}
                        includeHolidays={this.state.includeHolidays}
                        onDaysUpdate={this.updateDays}
                        dayRange={this.state.dayRange}
                        onDatesUpdate={this.updateDates}
                        dateRange={this.state.dateRange}
                        onTimesUpdate={this.updateTimes}
                        presets={["Working Week", "Custom"]}
                        onPresetChange={this.updatePreset}
                        onGo={this.downloadData}
                    />}
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
