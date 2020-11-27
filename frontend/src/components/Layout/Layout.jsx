import React from "react";
import Sidebar from "react-sidebar";
import {Button} from "@material-ui/core"
import SidebarContent from "./SidebarContent";
import Mapbox from "../Map/Mapbox";
import { MIN_DATE, MAX_DATE } from "./Range";
import { parseTimePeriods, formattedTimeString } from "./DateTimeParser";
import {getLinksBetweenNodes, getTravelDataFile} from "../../actions/actions";
import "./Layout.css";

export const DAYS_OF_WEEK_MAPPING = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];


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
                startTime: formattedTimeString(MIN_DATE),
                endTime: formattedTimeString(MAX_DATE),
                daysOfWeek: [true, true, true, true, true, true, true],
                includeHolidays: false
            }],
            fileType: "csv",
            disableGetButton: false
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    }

    onSetSidebarOpen(open) {
        this.setState({sidebarOpen: open});
    }

    updateNodes = (newNodes) => {
        this.setState({nodesList: newNodes});
    }

    updateLinks = (newLinks) => {
        let tempLinksList = this.state.linksList;
        tempLinksList.push(newLinks);
        this.setState({linksList: tempLinksList});
    }

    getLinks = (doc, enableInteractions) => {
        getLinksBetweenNodes(doc, this.state.nodesList, enableInteractions);
    }

    resetMapVars = () => {
        this.setState({linksList: [], nodesList: []});
    }

    changeDateTimeRange(event) {
        let rangeChoice = event.value;
        let choice = parseInt(rangeChoice.split(" ")[1]);
        this.setState({activeRange: choice - 1});
    }

    removeAllLinks = () => {
        this.setState({linksList: []});
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
        });
        this.setState({
            numRanges: numRanges + 1,
            activeRange: numRanges,
            ranges: ranges
        });
    }

    replicateRange() {
        let numRanges = this.state.numRanges;
        let ranges = [...this.state.ranges];
        let activeRange = {...ranges[this.state.activeRange]};
        ranges.push({
            startDate: activeRange.startDate,
            endDate: activeRange.endDate,
            startTime: activeRange.startTime,
            endTime: activeRange.endTime,
            daysOfWeek: activeRange.daysOfWeek,
            includeHolidays: activeRange.includeHolidays
        });
        this.setState({
            numRanges: numRanges + 1,
            activeRange: numRanges,
            ranges: ranges
        });
    }

    deleteCurrRange() {
        if (this.state.numRanges <= 1) {
            alert("Must have at least one range!");
            return;
        }
        let numRanges = this.state.numRanges;
        let new_ranges = [...this.state.ranges];
        new_ranges.splice(this.state.activeRange, 1);

        let newActiveRange = this.state.activeRange;

        if (newActiveRange > 0) {
            newActiveRange--;
        }

        this.setState({
            numRanges: numRanges - 1,
            activeRange: newActiveRange,
            ranges: new_ranges
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
                activeRange.startTime = "06:00";
                activeRange.endTime = "09:00";
                activeRange.daysOfWeek = [true, true, true, true, true, false, false];
                ranges[this.state.activeRange] = activeRange;
                this.setState({ranges: ranges});
                break;

            case "Working Week Night":
                activeRange.startTime = "15:00";
                activeRange.endTime = "18:00";
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
        this.setState({fileType: e.target.value});
    }

    downloadData = () => {

        if (this.state.linksList.length !== 0) {
            let allLinkDirs = [];
            this.state.linksList.forEach((seq) => {
                let tmpLinkDirs = [];
                seq.forEach((link) => {
                    tmpLinkDirs = tmpLinkDirs.concat(link.link_dirs);
                });
                allLinkDirs.push(tmpLinkDirs);
            });

            const list_of_time_periods = parseTimePeriods(this.state.ranges);
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

            this.setState({disableGetButton: true});
            getTravelDataFile(params, () => {
                this.setState({disableGetButton: false});
            });
        } else {
            alert("Please get links first");
            this.setState({disableGetButton: false});
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
                        replicateCurrRange={this.replicateRange.bind(this)}
                        deleteCurrRange={this.deleteCurrRange.bind(this)}
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
                        style={{position: "absolute", right: "22%", height: "40px", width: "10%", top: "5px"}}
                    >
                        Edit Query
                    </Button>
                </Sidebar>
                <Mapbox
                    onLinkUpdate={this.updateLinks}
                    onNodeUpdate={this.updateNodes}
                    getLinks={this.getLinks}
                    resetMapVars={this.resetMapVars}
                    removeAllLinks={this.removeAllLinks}
                />
            </div>
        );

    }
}

export default Layout;
