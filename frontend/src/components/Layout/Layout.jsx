import React from "react";
import Sidebar from "react-sidebar";
import { Button } from "@material-ui/core"
import SidebarContent from "./SidebarContent";
import Mapbox from "../Map/Mapbox";
import {getLinksBetweenNodes, getTravelDataFile} from "../../actions/actions";
import "./Layout.css"

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
                startDate: new Date(MIN_DATE),
                endDate: new Date(MAX_DATE),
                startTime: this.formattedTimeString(MIN_DATE),
                endTime: this.formattedTimeString(MAX_DATE),
                daysOfWeek: [true, true, true, true, true, true, true],
                includeHolidays: false
            }],
            fileType: "csv",
            disableGetButton: false
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

    getLinks = (doc, enableInteractions) => {
        getLinksBetweenNodes(doc, this.state.nodesList, enableInteractions)
    }

    resetMapVars = () => {
        this.setState({linksList: [], nodesList: []})
    }

    changeDateTimeRange(event) {
        let rangeChoice = event.value;
        let choice = parseInt(rangeChoice.split(" ")[1]);
        this.setState({activeRange: choice - 1});
    }

    addRange() {
        let numRanges = this.state.numRanges;
        let ranges = [...this.state.ranges];
        ranges.push({
            startDate: new Date(MIN_DATE),
            endDate: new Date(MAX_DATE),
            startTime: this.formattedTimeString(MIN_DATE),
            endTime: this.formattedTimeString(MAX_DATE),
            daysOfWeek: [true, true, true, true, true, true, true],
            includeHolidays: false
        })
        this.setState({
            numRanges: numRanges + 1,
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
                this.setState({ranges: ranges});
                break;

            case "Working Week Night":
                activeRange.startTime = new Date('2020-01-01 15:00:00');
                activeRange.endTime = new Date('2020-01-01 18:00:00');
                activeRange.daysOfWeek = [true, true, true, true, true, false, false];
                ranges[this.state.activeRange] = activeRange;
                this.setState({ranges: ranges});
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
        this.setState({ranges: ranges});
    }

    onEndDateChange = (value) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        activeRange.endDate = value;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ranges: ranges});
    }

    onStartTimeChange = (value) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        activeRange.startTime = value;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ranges: ranges});
    }

    onEndTimeChange = (value) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        activeRange.endTime = value;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ranges: ranges});
    }

    onDaysOfWeekChange = (index) => {
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        let newDaysOfWeek = [...activeRange.daysOfWeek];
        newDaysOfWeek[index] = !newDaysOfWeek[index];
        activeRange.daysOfWeek = newDaysOfWeek;
        ranges[this.state.activeRange] = activeRange;
        this.setState({ranges: ranges});
    }

    onFileTypeUpdate = (e) => {
        this.setState({fileType: e.target.value})
    }

    downloadData = () => {

        if (this.state.linksList.length !== 0) {
            let allLinkDirs = [];
            this.state.linksList.forEach((seq) => {
                let tmpLinkDirs = []
                seq.forEach((link) => {
                    tmpLinkDirs = tmpLinkDirs.concat(link.link_dirs)
                })
                allLinkDirs.push(tmpLinkDirs)
            });

            const list_of_time_periods = this.parseTimePeriods();
            if (!list_of_time_periods) {
                alert("Must complete all of start date, end date, start time and end time!");
                return;
            }

            const fileData = this.state.fileType.split("-");

            let params = {
                listOfTimePeriods: list_of_time_periods,
                listOfLinkDirs: allLinkDirs,
                fileType: fileData[0],
                fileArgs: fileData[1]
            };

            this.setState({disableGetButton: true})
            getTravelDataFile(params, () => {
                this.setState({disableGetButton: false})
            });
        } else {
            alert("Please get links first");
            this.setState({disableGetButton: false})
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

        return `${hour}:${minute}`
    }

    zeroPadNumber(number) {
        let padded = number.toString()
        if (padded.length < 2) {
            padded = "0" + padded;
        }
        return padded;
    }

    parseTimePeriods() {
        let timePeriods = [];
        let succeeded = true;
        this.state.ranges.forEach(value => {
            if (!succeeded || !value || !value.startDate || !value.endDate || !value.startTime || !value.endTime) {
                succeeded = false;
                return;
            }

            const startDateStr = this.formattedDateString(value.startDate)
            const endDateStr = this.formattedDateString(value.endDate)
            const startTimeStr = value.startTime
            const endTimeStr = value.endTime

            timePeriods.push({
                "start_time": startTimeStr,
                "end_time": endTimeStr,
                "start_date": startDateStr,
                "end_date": endDateStr,
                "days_of_week": value.daysOfWeek,
                "include_holidays": value.includeHolidays
            });
        });

        if (succeeded) {
            return timePeriods;
        } else {
            return null;
        }
    }

    render() {
        const presets = ["Working Week Morning", "Working Week Night", "Custom"];
        const activeRange = this.state.ranges[this.state.activeRange];
        return (
            <div>
                <Sidebar
                    sidebar={<SidebarContent
                        disableGetButton={this.state.disableGetButton}

                        onFileTypeUpdate={this.onFileTypeUpdate.bind(this)}

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
                    rootClassName={"topbar"}
                    sidebarClassName={"sidebar"}
                >
                    <Button
                        variant="contained"
                        onClick={() => this.onSetSidebarOpen(true)}
                        style={{position: "absolute", right: "5%", height: "40px", width: "10%", top: "5px"}}
                    >
                        Open Sidebar
                    </Button>
                </Sidebar>
                <Mapbox
                    onLinkUpdate={this.updateLinks}
                    onNodeUpdate={this.updateNodes}
                    getLinks={this.getLinks}
                    resetMapVars={this.resetMapVars}
                />
            </div>
        );

    }
}

export default Layout;
