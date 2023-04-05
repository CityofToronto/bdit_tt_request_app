import React from "react";
import Sidebar from "react-sidebar";
import { Button } from "@material-ui/core"
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import SidebarContent from "./Sidebar/SidebarContent";
import Map from "../Map";
import RangeFactory from "./Datetime/Range";
import parseTimePeriods from "./Datetime/TimeRangeParser";
import { getLinksBetweenNodes /*getTravelDataFile*/ } from "../../actions/actions";
import FieldSelectMenu from "./FieldSelectMenu/FieldSelectMenu";
import FileSettingsFactory from "./Settings/FileSettings";
import Tooltip from '@material-ui/core/Tooltip';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import "./Layout.css";

const dateRange = {
    maxDate: Date('2021-01-01'), 
    minDate: new Date('2020-01-01')
}

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: false,
            popupOpen: false,
            nodesList: [],
            linksList: [],
            numRanges: 1,
            activeRange: 0,
            ranges: [
                RangeFactory.newRange(
                    {
                        startTime: dateRange.minDate,
                        endTime: dateRange.maxDate
                    }
                )
            ],
            fileSettings: FileSettingsFactory.newFileSettings({endDate: dateRange.maxDate}),
            disableGetButton: false
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
        this.handleClose = this.handleClose.bind(this)
        this.openPopup = this.openPopup.bind(this)
        this.replaceSettings = this.replaceSettings.bind(this)
        this.addRange = this.addRange.bind(this)
        this.replicateRange = this.replicateRange.bind(this)
        this.deleteCurrRange = this.deleteCurrRange.bind(this)
        this.changeDateTimeRange = this.changeDateTimeRange.bind(this)
        this.renameRange = this.renameRange.bind(this)
        this.replaceActiveRange = this.replaceActiveRange.bind(this)
        this.replaceSettings = this.replaceSettings.bind(this)
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
        let choice = parseInt(rangeChoice.split(" ")[0]);
        this.setState({activeRange: choice - 1});
    }

    removeAllLinks = () => {
        this.setState({linksList: []});
    }

    addRange() {
        let numRanges = this.state.numRanges;
        let ranges = [...this.state.ranges];
        const name = prompt("Name the new range")
        if (!name || name === "") {
            if (name === "") {
                NotificationManager.error('You must enter a name');
            }
        } else {
            ranges.push(RangeFactory.newRange({
                name: name,
                startTime: dateRange.minDate,
                endTime: dateRange.maxDate
            }));
            this.setState({
                numRanges: numRanges + 1,
                activeRange: numRanges,
                ranges: ranges
            });
        }
    }

    replicateRange() {
        let numRanges = this.state.numRanges;
        let ranges = [...this.state.ranges];
        let activeRange = ranges[this.state.activeRange];
        let params = activeRange.getParams();

        const name = prompt("Name the new Range");

        if (!name || name === "") {
            if (name === "") {
                NotificationManager.error('You must enter a name');
            }
        } else {
            params.name = name;
            ranges.push(RangeFactory.newRange(params));
            this.setState({
                numRanges: numRanges + 1,
                activeRange: numRanges,
                ranges: ranges
            });
        }
    }

    renameRange() {
        const name = prompt("Enter the new Name");
        if (!name || name === "") {
            if (name === "") {
                NotificationManager.error('You must enter a name');
            }
        } else {
            let params = this.state.ranges[this.state.activeRange].getParams();
            params.name = name;
            this.replaceActiveRange(params);
        }
    }

    deleteCurrRange() {
        if (this.state.numRanges <= 1) {
            NotificationManager.error('Must have at least one range!');
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

    downloadGeoJSON() {
        let filename = "geometry_data.json";
        let contentType = "application/json;charset=utf-8;";

        let geoJSON = {
            "type": "FeatureCollection",
            "features": this.state.linksList.flat().map( (segment,i) => {
                return {
                    "type": "Feature",
                    "properties": {
                        "segment_number": i,
                        "link_dirs": segment.link_dirs,
                        "link_name": segment.path_name,
                        "source_node_id": segment.source,
                        "target_node_id": segment.target
                    },
                    "geometry": segment.geometry
                }
            } )
        };

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            let blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(geoJSON, null, "\t")))], {type: contentType});
            navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            let a = document.createElement('a');
            a.download = filename;
            a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(geoJSON, null, "\t"));
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
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
                NotificationManager.error('Must complete all of start time and end time!');
                return;
            }

            const fileParams = this.state.fileSettings.parseSettings();
            const fileType = fileParams['file_type'];

            if (fileType === 'geojson') {
                this.downloadGeoJSON();
            } else {
                NotificationManager.error('Only GeoJSON filetype is currently supported');
                return;
            }
        } else {
            NotificationManager.error('Please get links first');
            this.setState({disableGetButton: false});
        }

    }

    openPopup() { this.setState({popupOpen: true}) }
    handleClose() { this.setState({popupOpen: false}) }

    replaceActiveRange = (params) => {
        let ranges = [...this.state.ranges];
        ranges[this.state.activeRange] = RangeFactory.newRange(params);
        this.setState({ranges: ranges});
    }

    replaceSettings = (params) => {
        this.setState(
            { fileSettings: FileSettingsFactory.newFileSettings(params) }
        )
    }

    render() {
        const activeRange = this.state.ranges[this.state.activeRange];
        let rangeNames = [];
        for (let i = 0; i < this.state.numRanges; i++) {
            rangeNames.push(`${i + 1} ${this.state.ranges[i].getName()}`);
        }

        return (
            <div>
                <Sidebar
                    sidebar={<SidebarContent
                        disableGetButton={this.state.disableGetButton}
                        openPopup={this.openPopup}

                        range={this.state.activeRange}

                        onGo={this.downloadData}
                        fileSettings={this.state.fileSettings}
                        replaceSettings={this.replaceSettings}

                        dateTimeRanges={this.state.numRanges}
                        addNewRange={this.addRange}
                        replicateCurrRange={this.replicateRange}
                        deleteCurrRange={this.deleteCurrRange}
                        changeDateTimeRange={this.changeDateTimeRange}
                        renameRange={this.renameRange}

                        activeRange={activeRange}
                        replaceActiveRange={this.replaceActiveRange}
                        rangeNames={rangeNames}
                        state={this.props.state}
                    />}
                    open={this.state.sidebarOpen}
                    onSetOpen={this.onSetSidebarOpen}
                    rootClassName={"topbar"}
                    sidebarClassName={"sidebar"}
                >
                    <Tooltip title={<span style={{fontSize: "20px"}}>Click to edit query and get file.</span>}>
                        <Button
                            variant="contained"
                            onClick={() => this.onSetSidebarOpen(true)}
                            style={{position: "absolute", right: "22%", height: "40px", width: "10%", top: "5px"}}
                        >
                            Edit Query
                        </Button>
                    </Tooltip>
                </Sidebar>

                <Map
                    onLinkUpdate={this.updateLinks}
                    onNodeUpdate={this.updateNodes}
                    getLinks={this.getLinks}
                    resetMapVars={this.resetMapVars}
                    removeAllLinks={this.removeAllLinks}
                />

                <Dialog
                    open={this.state.popupOpen}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >

                    <DialogTitle id="form-dialog-title">Choose columns to include in the response <br/>(leave empty if
                        requires all)</DialogTitle>

                    <DialogActions>
                        <FieldSelectMenu
                            replaceSettings={this.replaceSettings}
                            fileSettings={this.state.fileSettings}
                            handleClose={this.handleClose}
                        />
                    </DialogActions>

                </Dialog>
                <NotificationContainer/>
            </div>
        );

    }
}