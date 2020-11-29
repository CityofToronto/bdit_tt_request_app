import React from "react";
import Sidebar from "react-sidebar";
import {Button} from "@material-ui/core"
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import SidebarContent from "./SidebarContent";
import Mapbox from "../Map/Mapbox";
import RangeFactory from "./Range";
import { parseTimePeriods } from "./DateTimeParser";
import {getLinksBetweenNodes, getTravelDataFile} from "../../actions/actions";
import "./Layout.css";


class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: true,
            popupOpen: false,
            nodesList: [],
            linksList: [],
            numRanges: 1,
            activeRange: 0,
            ranges: [RangeFactory.newRange({})],
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
        if(!name || name === ""){
            alert("You must enter a name");
        } else {
            ranges.push(RangeFactory.newRange({ name: name }));
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

        if(!name || name === ""){
            alert("You must enter a name");
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

    onFileTypeUpdate = (e) => {
        this.setState({fileType: e.target.value});
    }

    openPopup(){
        this.setState({ popupOpen: true })
    }

    handleClose(){
        this.setState({ popupOpen: false });
    }

    replaceActiveRange = (params) => {
        let ranges = [...this.state.ranges];
        ranges[this.state.activeRange] = RangeFactory.newRange(params);
        this.setState({ ranges: ranges });
    }

    render() {
        const activeRange = this.state.ranges[this.state.activeRange];
        let rangeNames = [];
        for(let i = 0; i < this.state.numRanges; i++){
            rangeNames.push(`${i+1} ${this.state.ranges[i].getName()}`);
        }

        return (
            <div>
                <Sidebar
                    sidebar={<SidebarContent
                        disableGetButton={this.state.disableGetButton}
                        onFileTypeUpdate={this.onFileTypeUpdate.bind(this)}
                        openPopup={this.openPopup.bind(this)}

                        range={this.state.activeRange}

                        onGo={this.downloadData}

                        dateTimeRanges={this.state.numRanges}
                        addNewRange={this.addRange.bind(this)}
                        replicateCurrRange={this.replicateRange.bind(this)}
                        deleteCurrRange={this.deleteCurrRange.bind(this)}
                        changeDateTimeRange={this.changeDateTimeRange.bind(this)}

                        activeRange={activeRange}
                        replaceActiveRange={this.replaceActiveRange.bind(this)}
                        rangeNames={rangeNames}
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

                <Dialog fullScreen
                        open={this.state.popupOpen}
                        onClose={this.handleClose.bind(this)}
                        aria-labelledby="form-dialog-title"
                >

                    <DialogTitle id="form-dialog-title">Field Selection</DialogTitle>

                    <DialogContentText>
                        Please choose which fields to include in the response
                    </DialogContentText>

                    <DialogActions>
                        <Button onClick={this.handleClose.bind(this)} variant="contained" color="primary">
                            Done
                        </Button>
                    </DialogActions>

                </Dialog>
            </div>
        );

    }
}

export default Layout;
