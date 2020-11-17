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
            ranges: [{
                startDate: MIN_DATE,
                endDate: MAX_DATE,
                startTime: MIN_DATE,
                endTime: MAX_DATE,
                daysOfWeek: [true, true, true, true, true, true, true],
                includeHolidays: false
            }]
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this)
    }

    onSetSidebarOpen(open) {
        this.setState({sidebarOpen: open});
    }

    updateNodes = (newNodes) => {
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

    changeDateTimeRange(event){
        let rangeChoice = event.value;
        let choice = parseInt(rangeChoice.split(" ")[1]);
        this.setState({activeRange: choice-1});
    }

    addRange(){
        let numRanges = this.state.numRanges;
        let ranges = [...this.state.ranges];
        ranges.push({
            startDate: MIN_DATE,
            endDate: MAX_DATE,
            startTime: MIN_DATE,
            endTime: MAX_DATE,
            daysOfWeek: [true, true, true, true, true, true, true],
            includeHolidays: false
        })
        this.setState({
            numRanges: numRanges+1,
            activeRange: numRanges,
            ranges: ranges
        });
    }

    handleHolidays = () => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        activeRange.includeHolidays = !activeRange.includeHolidays;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ranges: ranges});
    }

    updatePreset = (event) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        switch (event.value) {
            case "Working Week Morning":
                activeRange.startTime = new Date('2020-01-01 06:00:00');
                activeRange.endTime = new Date('2020-01-01 09:00:00');
                activeRange.daysOfWeek = [true, true, true, true, true, false, false];
                ranges[this.state.activeRange] = activeRange;
                this.setState({ ranges: ranges });
                break;

            case "Working Week Night":
                activeRange.startTime = new Date('2020-01-01 15:00:00');
                activeRange.endTime = new Date('2020-01-01 18:00:00');
                activeRange.daysOfWeek = [true, true, true, true, true, false, false];
                ranges[this.state.activeRange] = activeRange;
                this.setState({ ranges: ranges });
                break;

            default:
                break;
        }
    }

    onStartDateChange = (value) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        activeRange.startDate = value;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ ranges: ranges });
    }

    onEndDateChange = (value) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        activeRange.endDate = value;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ ranges: ranges });
    }

    onStartTimeChange = (value) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        activeRange.startTime = value;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ ranges: ranges });
    }

    onEndTimeChange = (value) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        activeRange.endTime = value;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ ranges: ranges });
    }

    onDaysOfWeekChange = (index) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        let newDaysOfWeek = [...activeRange.daysOfWeek];
        newDaysOfWeek[index] = !newDaysOfWeek[index];
        activeRange.daysOfWeek = newDaysOfWeek;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ ranges: ranges });
    }

    downloadData = () => {
        if (this.state.linksList.length !== 0) {
            let params = this.parseData();
            let allLinkDirs = [];
            this.state.linksList.forEach((seq) => {
                let tmpLinkDirs = []
                seq.forEach((link) => {
                    tmpLinkDirs = tmpLinkDirs.concat(link.link_dirs)
                })
                allLinkDirs.push(tmpLinkDirs)
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
        const activeRange = this.state.ranges[this.state.activeRange];
        const startDateStr = this.formattedDateString(activeRange.startDate)
        const endDateStr = this.formattedDateString(activeRange.endDate)
        const startTimeStr = this.formattedTimeString(activeRange.startTime)
        const endTimeStr = this.formattedTimeString(activeRange.endTime)

        return {
            "startTime": startTimeStr,
            "endTime": endTimeStr,
            "startDate": startDateStr,
            "endDate": endDateStr,
            "daysOfWeek": activeRange.daysOfWeek,
            "includeHolidays": activeRange.includeHolidays
        }
    }

    render() {
        const presets = ["Working Week Morning", "Working Week Night", "Custom"];
        const activeRange = this.state.ranges[this.state.activeRange];
        return (
            <div id={"header"} style={{color: "black"}}>
                <Sidebar
                    sidebar={<SidebarContent
                        onHolidayUpdate={this.handleHolidays.bind(this)}
                        includeHolidays={activeRange.includeHolidays}

                        presets={presets}
                        onPresetChange={this.updatePreset.bind(this)}

                        onGo={this.downloadData}

                        onStartDateChange={this.onStartDateChange.bind(this)}
                        startDate={activeRange.startDate}
                        onEndDateChange={this.onEndDateChange.bind(this)}
                        endDate={activeRange.endDate}

                        onStartTimeChange={this.onStartTimeChange.bind(this)}
                        startTime={activeRange.startTime}
                        onEndTimeChange={this.onEndTimeChange.bind(this)}
                        endTime={activeRange.endTime}

                        daysOfWeek={activeRange.daysOfWeek}
                        onDaysOfWeekChange={this.onDaysOfWeekChange.bind(this)}

                        dateTimeRanges={this.state.numRanges}
                        addNewRange={this.addRange.bind(this)}
                        range={this.state.activeRange}
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
