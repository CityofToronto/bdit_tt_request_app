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
            numRanges: 1,
            activeRange: 0,
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
        console.log(newLinks)
        this.setState({linksList: newLinks})
    }

    getLinks = (doc) => {
        getLinksBetweenNodes(doc, this.state.nodesList)
    }

    changeDateTimeRange(event){
        let rangeChoice = event.value;
        let choice = parseInt(rangeChoice.split(" ")[1]);
        this.setState({activeRange: choice-1});
    }

    handleHolidays = () => {
        this.setState({includeHolidays: !this.state.includeHolidays})
    }

    updatePreset = (event) => {
        console.log(event);
        switch (event.value) {
            case "Working Week Morning":
                this.setState({
                    startTime: new Date('2020-01-01 06:00:00'),
                    endTime: new Date('2020-01-01 09:00:00'),
                    daysOfWeek: [true, true, true, true, true, false, false]
                });
                break;

            case "Working Week Night":
                this.setState({
                    startTime: new Date('2020-01-01 15:00:00'),
                    endTime: new Date('2020-01-01 18:00:00'),
                    daysOfWeek: [true, true, true, true, true, false, false]
                });
                break;

            default:
                break;
        }
    }

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
    }

    render() {
        const presets = ["Working Week Morning", "Working Week Night", "Custom"]
        return (
            <div id={"header"} style={{color: "black"}}>
                <Sidebar
                    sidebar={<SidebarContent
                        onHolidayUpdate={this.handleHolidays}
                        includeHolidays={this.state.includeHolidays}

                        presets={presets}
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

                        dateTimeRanges={this.state.numRanges}

                        ranges={this.state.activeRange}
                        changeDateTimeRange={this.changeDateTimeRange.bind(this)}
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
