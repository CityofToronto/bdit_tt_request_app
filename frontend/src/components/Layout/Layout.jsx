import React from "react";
import Sidebar from "react-sidebar";
import SidebarContent from "./SidebarContent";
import Mapbox from "../Map/Mapbox";
import {getLinksBetweenNodes, getTravelDataFile} from "../../actions/actions";

export const DAYS_OF_WEEK_MAPPING = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

export const MAX_DATE = new Date("2018-09-30 19:55:00");
export const MIN_DATE = new Date("2018-09-01 00:00:00");

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: true,
            nodesList: [],
            linksList: [],
            // timeRange: "",
            // dateRange: "",
            // dayRange: "",
            startDate: MIN_DATE,
            endDate: MAX_DATE,
            startTime: MIN_DATE,
            endTime: MAX_DATE,
            daysOfWeek: [true, true, true, true, true, true, true],
            includeHolidays: false
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this)
    }

    onSetSidebarOpen(open) {
        this.setState({sidebarOpen: open});
    }

    updateNodes = (newNodes) => {
        if (newNodes.length > 0) {
            console.log(newNodes[0])
        }
        this.setState({nodesList: newNodes})
    }

    updateLinks = (newLinks) => {
        let tempLinksList = this.state.linksList
        tempLinksList.push(newLinks)
        this.setState({linksList: tempLinksList})
    }

    getLinks = (doc) => {
        getLinksBetweenNodes(doc, this.state.nodesList)
    }

    handleHolidays = () => {
        this.setState({includeHolidays: !this.state.includeHolidays})
    }

    updatePreset = (event) => {
        console.log(event);
        switch (event.value) {
            case "Working Week":
                this.setState({timeRange: "0600:0900", dayRange: "mon:fri", includeHolidays: false});
                break;

            default:
                this.setState({timeRange: "", dayRange: "", includeHolidays: false})
        }
    }
    //
    // updateDates = (e) => {
    //     this.setState({dateRange: e.target.value})
    // }
    //
    // updateTimes = (e) => {
    //     this.setState({timeRange: e.target.value})
    // }
    //
    // updateDays = (e) => {
    //     this.setState({dayRange: e.target.value})
    // }

    onStartDateChange = (value) => {
        this.setState({startDate: value})
    }

    onEndDateChange = (value) => {
        this.setState({endDate: value})
    }

    onStartTimeChange = (value) => {
        this.setState({startTime: value})
    }

    onEndTimeChange = (value) => {
        this.setState({startTime: value})
    }

    onDaysOfWeekChange = (index) => {
        let newDaysOfWeek = [...this.state.daysOfWeek]
        newDaysOfWeek[index] = !newDaysOfWeek[index]
        this.setState({daysOfWeek: newDaysOfWeek})
    }

    downloadData = () => {
        if (this.state.linksList.length !== 0) {
            let params = this.parseData();
            let allLinkDirs = [];
            console.log(this.state.linksList)
            this.state.linksList.forEach((link) => {
                allLinkDirs = allLinkDirs.concat(link.link_dirs)
            });

            params.linkDirs = allLinkDirs;

            getTravelDataFile(params);
        } else {
            alert("Please get links first");
        }

    }

    formattedDateString(datetime) {
        const year = datetime.getFullYear();
        const month = this.zeroPadNumber(datetime.getMonth() + 1);
        const date = this.zeroPadNumber(datetime.getDate())

        return `${year}-${month}-${date}`
    }

    formattedTimeString(datetime) {
        const hour = this.zeroPadNumber(datetime.getHours())
        const minute = this.zeroPadNumber(datetime.getMinutes())
        const second = this.zeroPadNumber(datetime.getSeconds())

        return `${hour}:${minute}:${second}`
    }

    zeroPadNumber(number){
        let padded = number.toString()
        if (padded.length < 2) {
            padded = "0" + padded;
        }
        return padded;
    }

    parseData() {
        const startDateStr = this.formattedDateString(this.state.startDate)
        const endDateStr = this.formattedDateString(this.state.endDate)
        const startTimeStr = this.formattedTimeString(this.state.startTime)
        const endTimeStr = this.formattedTimeString(this.state.endTime)

        return {
            "startTime": startTimeStr,
            "endTime": endTimeStr,
            "startDate": startDateStr,
            "endDate": endDateStr,
            "daysOfWeek": this.state.daysOfWeek,
            "includeHolidays": this.state.includeHolidays
        }
        // let params = {};
        // let times = this.state.timeRange.split(":");
        // let days = this.state.dayRange.split(":");
        // const validDays = ["sun", "mon", "tues", "wed", "thurs", "fri", "sat"];
        // let dates = this.state.dateRange.split(":");
        //
        // // First validate the times
        // if (!(times.length === 2 && times[0].length === 4 && times[1].length === 4 &&
        //     parseInt(times[0]) < 2400 && parseInt(times[1]) < 2400 &&
        //     parseInt(times[0]) < parseInt(times[1]))) {
        //
        //     alert("Please enter a time range following the format: hhmm:hhmm")
        //
        //     // next validate the days
        // } else if (!(days.length === 2 && validDays.includes(days[0].toLowerCase()) &&
        //     validDays.includes(days[1].toLowerCase()) &&
        //     validDays.indexOf(days[0].toLowerCase()) <= validDays.indexOf(days[1].toLowerCase()))) {
        //
        //     alert("Please enter a day range following the format: start:end")
        //
        //     // finally validate the dates
        // } else if (!(dates.length === 2 && this.validDate(dates[0]) && this.validDate(dates[1]) &&
        //     parseInt(dates[0].replaceAll("-", "")) <=
        //     parseInt(dates[1].replaceAll("-", "")))) {
        //
        //     alert("Please enter a date range following the format: yyyy-mm-dd:yyyy-mm-dd");
        //
        //     // everything is valid so parse the data
        // } else {
        //     times[0] = times[0].substring(0, 2) + ":" + times[0].substring(2) + ":00"
        //     times[1] = times[1].substring(0, 2) + ":" + times[1].substring(2) + ":00"
        //     params = {
        //         startTime: dates[0] + " " + times[0],
        //         endTime: dates[1] + " " + times[1],
        //         startDay: days[0],
        //         endDay: days[1],
        //         fileType: "csv"
        //     }
        // }
        // return params;
    }

    //
    // validDate(dateString) {
    //     let segments = dateString.split("-");
    //     if (segments.length === 3 && this.strIsInt(segments[0]) && segments[0].length === 4 &&
    //         this.strIsInt(segments[1]) && segments[1].length === 2 &&
    //         this.strIsInt(segments[2]) && segments[2].length === 2) {
    //         return true;
    //     } else {
    //         console.log(segments.length);
    //         return false;
    //     }
    // }
    //
    // // From stack overflow
    // strIsInt(str) {
    //     str = str.replace(/^0+/, "") || "0";
    //     let n = Math.floor(Number(str));
    //     return n !== Infinity && String(n) === str && n >= 0;
    // }

    render() {
        return (
            <div id={"header"} style={{color: "black"}}>
                <Sidebar
                    sidebar={<SidebarContent
                        onHolidayUpdate={this.handleHolidays}
                        includeHolidays={this.state.includeHolidays}
                        // onDaysUpdate={this.updateDays}
                        // dayRange={this.state.dayRange}
                        // onDatesUpdate={this.updateDates}
                        // dateRange={this.state.dateRange}
                        // onTimesUpdate={this.updateTimes}
                        // presets={["Working Week", "Custom"]}
                        onPresetChange={this.updatePreset}
                        onGo={this.downloadData}
                        onStartDateChange={this.onStartDateChange}
                        startDate={this.state.startDate}
                        onEndDateChange={this.onEndDateChange}
                        endDate={this.state.endDate}
                        onStartTimeChange={this.onStartTimeChange}
                        startTime={this.state.startTime}
                        onEndTimeChange={this.onEndTimeChange}
                        endTime={this.state.endTime}
                        daysOfWeek={this.state.daysOfWeek}
                        onDaysOfWeekChange={this.onDaysOfWeekChange}
                    />}
                    open={this.state.sidebarOpen}
                    onSetOpen={this.onSetSidebarOpen}
                    styles={{sidebar: {background: "white", width: 350}}}
                >
                    <button
                        onClick={() => this.onSetSidebarOpen(true)}
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
