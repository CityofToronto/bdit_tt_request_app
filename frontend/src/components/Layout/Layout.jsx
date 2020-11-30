import React from "react";
import Sidebar from "react-sidebar";
import {Button, Checkbox} from "@material-ui/core"
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import SidebarContent from "./Sidebar/SidebarContent";
import Mapbox from "../Map/Mapbox";
import RangeFactory from "./Datetime/Range";
import { parseTimePeriods } from "./Datetime/DateTimeParser";
import {getLinksBetweenNodes, getTravelDataFile} from "../../actions/actions";
import "./Layout.css";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FileSettingsFactory from "./Settings/FileSettings";


class Layout extends React.Component {
    constructor(props) {
        super(props);
        let fields = []
        for(let i = 0; i < 29; i++){
            fields.push(false);
        }
        this.state = {
            sidebarOpen: true,
            popupOpen: false,
            nodesList: [],
            linksList: [],
            numRanges: 1,
            activeRange: 0,
            ranges: [RangeFactory.newRange({})],
            fileSettings: FileSettingsFactory.newFileSettings({}),
            fileType: "csv",
            fields: fields,
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

    fieldsChange(index){
        let fields = [...this.state.fields]
        fields[index] = !fields[index]
        this.setState({ fields: fields });
    }

    handleClose(){
        this.setState({ popupOpen: false });
    }

    replaceActiveRange = (params) => {
        let ranges = [...this.state.ranges];
        ranges[this.state.activeRange] = RangeFactory.newRange(params);
        this.setState({ ranges: ranges });
    }

    replaceSettings = (params) => {
        let newFileSettings = FileSettingsFactory.newFileSettings(params);
        this.setState({ fileSettings: newFileSettings });
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
                        fileSettings={this.state.fileSettings}
                        replaceSettings={this.replaceSettings.bind(this)}

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

                <Dialog
                        open={this.state.popupOpen}
                        onClose={this.handleClose.bind(this)}
                        aria-labelledby="form-dialog-title"
                >

                    <DialogTitle id="form-dialog-title">Field Selection</DialogTitle>

                    <DialogContentText>
                        Please choose which fields to include in the response
                    </DialogContentText>

                    <DialogActions>
                        <FormControl>
                            <FormGroup row>

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[0]}
                                                       onChange={this.fieldsChange.bind(this, 0)}
                                                       name={"mean_tt"}/>}
                                    label="mean_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[1]}
                                                       onChange={this.fieldsChange.bind(this, 1)}
                                                       name={"min_tt"}/>}
                                    label="min_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[2]}
                                                       onChange={this.fieldsChange.bind(this, 2)}
                                                       name={"pct_5_tt"}/>}
                                    label="pct_5_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[3]}
                                                       onChange={this.fieldsChange.bind(this, 3)}
                                                       name={"pct_10_tt"}/>}
                                    label="pct_10_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[4]}
                                                       onChange={this.fieldsChange.bind(this, 4)}
                                                       name={"pct_15_tt"}/>}
                                    label="pct_15_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[5]}
                                                       onChange={this.fieldsChange.bind(this, 5)}
                                                       name={"pct_20_tt"}/>}
                                    label="pct_20_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[6]}
                                                       onChange={this.fieldsChange.bind(this, 6)}
                                                       name={"pct_25_tt"}/>}
                                    label="pct_25_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[7]}
                                                       onChange={this.fieldsChange.bind(this, 7)}
                                                       name={"pct_30_tt"}/>}
                                    label="pct_30_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[8]}
                                                       onChange={this.fieldsChange.bind(this, 8)}
                                                       name={"pct_35_tt"}/>}
                                    label="pct_35_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[9]}
                                                       onChange={this.fieldsChange.bind(this, 9)}
                                                       name={"pct_40_tt"}/>}
                                    label="pct_40_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[10]}
                                                       onChange={this.fieldsChange.bind(this, 10)}
                                                       name={"pct_45_tt"}/>}
                                    label="pct_45_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[11]}
                                                       onChange={this.fieldsChange.bind(this, 11)}
                                                       name={"pct_50_tt"}/>}
                                    label="pct_50_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[12]}
                                                       onChange={this.fieldsChange.bind(this, 12)}
                                                       name={"pct_55_tt"}/>}
                                    label="pct_55_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[13]}
                                                       onChange={this.fieldsChange.bind(this, 13)}
                                                       name={"pct_60_tt"}/>}
                                    label="pct_60_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[14]}
                                                       onChange={this.fieldsChange.bind(this, 14)}
                                                       name={"pct_65_tt"}/>}
                                    label="pct_65_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[15]}
                                                       onChange={this.fieldsChange.bind(this, 15)}
                                                       name={"pct_70_tt"}/>}
                                    label="pct_70_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[16]}
                                                       onChange={this.fieldsChange.bind(this, 16)}
                                                       name={"pct_75_tt"}/>}
                                    label="pct_75_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[17]}
                                                       onChange={this.fieldsChange.bind(this, 17)}
                                                       name={"pct_80_tt"}/>}
                                    label="pct_80_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[18]}
                                                       onChange={this.fieldsChange.bind(this, 18)}
                                                       name={"pct_85_tt"}/>}
                                    label="pct_85_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[19]}
                                                       onChange={this.fieldsChange.bind(this, 19)}
                                                       name={"pct_90_tt"}/>}
                                    label="pct_90_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[20]}
                                                       onChange={this.fieldsChange.bind(this, 20)}
                                                       name={"pct_95_tt"}/>}
                                    label="pct_95_tt"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[21]}
                                                       onChange={this.fieldsChange.bind(this, 21)}
                                                       name={"std_dev"}/>}
                                    label="std_dev"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[22]}
                                                       onChange={this.fieldsChange.bind(this, 22)}
                                                       name={"min_spd"}/>}
                                    label="min_spd"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[23]}
                                                       onChange={this.fieldsChange.bind(this, 23)}
                                                       name={"mean_spd"}/>}
                                    label="mean_spd"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[24]}
                                                       onChange={this.fieldsChange.bind(this, 24)}
                                                       name={"max_spd"}/>}
                                    label="max_spd"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[25]}
                                                       onChange={this.fieldsChange.bind(this, 25)}
                                                       name={"total_length"}/>}
                                    label="total_length"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[26]}
                                                       onChange={this.fieldsChange.bind(this, 26)}
                                                       name={"days_of_data"}/>}
                                    label="days_of_data"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[27]}
                                                       onChange={this.fieldsChange.bind(this, 27)}
                                                       name={"requested_days"}/>}
                                    label="requested_days"
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={this.state.fields[28]}
                                                       onChange={this.fieldsChange.bind(this, 28)}
                                                       name={"prop_5min"}/>}
                                    label="prop_5min"
                                />
                            </FormGroup>
                        </FormControl>
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
