import React from "react";
import Dropdown from "react-dropdown";
import {Button, Checkbox, Grid, Select} from "@material-ui/core";
import "react-dropdown/style.css";
import "./SidebarContent.css";
import DatePicker from "react-date-picker";
import TimePicker from 'react-time-picker';

import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {MAX_DATE, MIN_DATE} from "../Datetime/Range";
import Presets from "../Datetime/Presets"
import Days from "../Settings/Days";
import Tooltip from '@material-ui/core/Tooltip';


class SidebarContent extends React.Component {

    updatePreset(event) {
        let choice = event.value;
        let params = this.props.activeRange.getParams();
        let newParams = Presets.getParams(choice);
        Object.assign(params, newParams);
        this.props.replaceActiveRange(params);
    }

    startDateChange(value) {
        let params = this.props.fileSettings.getParams();
        params.startDate = value;
        this.props.replaceSettings(params);
    }

    endDateChange(value) {
        let params = this.props.fileSettings.getParams();
        params.endDate = value;
        this.props.replaceSettings(params);
    }

    startTimeChange(value) {
        let params = this.props.activeRange.getParams();
        let dateStr = '2020-01-01 '.concat(value).concat(':00');
        params.startTime = new Date(dateStr);
        this.props.replaceActiveRange(params);
    }

    endTimeChange(value) {
        let params = this.props.activeRange.getParams();
        let dateStr = '2020-01-01 '.concat(value).concat(':00');
        params.endTime = new Date(dateStr);
        this.props.replaceActiveRange(params);
    }

    daysOfWeekChange(index) {
        let params = this.props.fileSettings.getParams();
        let newDaysOfWeek = [...params.daysOfWeek];
        newDaysOfWeek[index] = !newDaysOfWeek[index];
        params.daysOfWeek = newDaysOfWeek;
        this.props.replaceSettings(params);
    }

    includeHolidaysChange() {
        let params = this.props.fileSettings.getParams();
        params.includeHolidays = !params.includeHolidays;
        this.props.replaceSettings(params);
    }

    fileTypeChange(event) {
        let params = this.props.fileSettings.getParams();
        params.fileType = event.target.value;
        this.props.replaceSettings(params);
    }

    render() {
        const rangeParams = this.props.activeRange.getParams();
        const fileParams = this.props.fileSettings.getParams();
        let params = {};
        Object.assign(params, rangeParams);
        Object.assign(params, fileParams);

        return (
            <div id="sidebar-container">
                <Grid container direction="column" alignItems="flex-start" alignContent="center" spacing={6}>

                    <Grid item>
                        <Grid container direction="column" alignItems="center" alignContent="center" spacing={2}>
                            <Grid item>
                                <Tooltip placement={'right'} title={<span style={{ fontSize: "20px"}}>
                                    Click to select your desired file format. XLSX and CSV are supported.
                                </span>}>
                                    <div
                                        ref={React.createRef()}>
                                        File Type: &nbsp; &nbsp;
                                        <Select
                                            native
                                            value={params.fileType}
                                            onChange={this.fileTypeChange.bind(this)}
                                        >
                                            <option value={"csv"}>csv</option>
                                            <option value={"xlsx"}>xlsx</option>
                                        </Select>
                                    </div>
                                </Tooltip>
                            </Grid>

                            <Grid item>
                                <Tooltip title={<span style={{ fontSize: "20px"}}>Click to check one or more choices of data columns in the file.</span>}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={this.props.openPopup}
                                        className={"popup"}
                                    >
                                        Choose Response Fields
                                    </Button>
                                </Tooltip>
                            </Grid>

                            <Grid item>
                                <Tooltip title={<span style={{ fontSize: "20px"}}>After you are all set, click to generate the travel data file.</span>}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={this.props.onGo}
                                        disabled={this.props.disableGetButton}
                                        className={"download"}
                                    >{this.props.disableGetButton ? `Please Wait` : `Get Displayed Links' Data`}
                                    </Button>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <Grid container direction="row" alignContent="center" alignItems="flex-start" spacing={5}>
                            <Grid item>
                                <h5>Start Date</h5>
                                <Tooltip title={<span style={{ fontSize: "20px"}}>Set the start date of the query by picking a date from the calendar or in the format of YYYY-MM-DD.</span>}>
                                    <DatePicker required={true} locale={"en-CA"}
                                            maxDate={MAX_DATE}
                                            minDate={MIN_DATE}
                                            format={"y-MM-dd"}
                                            value={params.startDate}
                                            onChange={this.startDateChange.bind(this)}
                                    />
                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <h5>End Date</h5>
                                <Tooltip title={<span style={{ fontSize: "20px"}}>Set the end date of the query by picking a date from the calendar or in the format of YYYY-MM-DD.</span>}>
                                    <DatePicker required={true}
                                            locale={"en-CA"}
                                            maxDate={MAX_DATE}
                                            minDate={MIN_DATE}
                                            format={"y-MM-dd"}
                                            value={params.endDate}
                                            onChange={this.endDateChange.bind(this)}
                                    />
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>


                    <Grid item>
                        <Tooltip title={<span style={{ fontSize: "20px"}}>Check to set days of week to be included in the query.</span>}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Select Days of Week</FormLabel>
                                <FormGroup row>
                                    <FormControlLabel
                                        control={<Checkbox checked={params.daysOfWeek[Days.Monday]}
                                                           onChange={this.daysOfWeekChange.bind(this, Days.Monday)}
                                                           name={Days.getDay(Days.Monday)}/>}
                                        label="Monday"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={params.daysOfWeek[Days.Tuesday]}
                                                           onChange={this.daysOfWeekChange.bind(this, Days.Tuesday)}
                                                           name={Days.getDay(Days.Tuesday)}/>}
                                        label="Tuesday"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={params.daysOfWeek[Days.Wednesday]}
                                                           onChange={this.daysOfWeekChange.bind(this, Days.Wednesday)}
                                                           name={Days.getDay(Days.Wednesday)}/>}
                                        label="Wednesday"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={params.daysOfWeek[Days.Thursday]}
                                                           onChange={this.daysOfWeekChange.bind(this, Days.Thursday)}
                                                           name={Days.getDay(Days.Thursday)}/>}
                                        label="Thursday"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={params.daysOfWeek[Days.Friday]}
                                                           onChange={this.daysOfWeekChange.bind(this, Days.Friday)}
                                                           name={Days.getDay(Days.Friday)}/>}
                                        label="Friday"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={params.daysOfWeek[Days.Saturday]}
                                                           onChange={this.daysOfWeekChange.bind(this, Days.Saturday)}
                                                           name={Days.getDay(Days.Saturday)}/>}
                                        label="Saturday"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={params.daysOfWeek[Days.Sunday]}
                                                           onChange={this.daysOfWeekChange.bind(this, Days.Sunday)}
                                                           name={Days.getDay(Days.Sunday)}/>}
                                        label="Sunday"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Tooltip>
                    </Grid>


                    <Grid item>
                        <Tooltip title={<span style={{ fontSize: "20px"}}>Check to whether include holidays in the query.</span>}>
                            <FormControlLabel
                                control={<Checkbox checked={params.includeHolidays}
                                                   onChange={this.includeHolidaysChange.bind(this)}
                                                   name={"holiday"}/>}
                                label="Include Holidays"
                            />
                        </Tooltip>
                    </Grid>

                    <Grid item>
                        <Grid container direction="column" alignItems="flex-start" alignContent="center" spacing={1}>
                            <Tooltip placement={'right'} title={<span style={{ fontSize: "20px"}}>Click to select time range to edit.</span>}>
                                <Grid item>
                                    <Grid container direction="row" alignItems="center" alignContent="center" spacing={1}>
                                        <Grid item>
                                            <h5>Current time range: </h5>
                                        </Grid>
                                        <Grid item>
                                            <Dropdown
                                                options={this.props.rangeNames}
                                                value={this.props.rangeNames[this.props.range]}
                                                onChange={this.props.changeDateTimeRange}
                                            />

                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Tooltip>

                            <Grid item>
                                <Grid container direction="column" alignContent="flex-start" alignItems="flex-start"
                                      spacing={1}>

                                    <Grid item>
                                        <Button variant="outlined" color="primary" size="small"
                                                onClick={this.props.renameRange}>
                                            Rename Range
                                        </Button>
                                    </Grid>

                                    <Grid item>
                                        <Button variant="outlined" color="primary" size="small"
                                                onClick={this.props.addNewRange}>
                                            Add New Time Range
                                        </Button>
                                    </Grid>

                                    <Grid item>
                                        <Button variant="outlined" color="primary" size="small"
                                                onClick={this.props.replicateCurrRange}>
                                            Replicate Current Time Range
                                        </Button>
                                    </Grid>

                                    <Grid item>
                                        <Button variant="outlined" color="primary" size="small"
                                                onClick={this.props.deleteCurrRange}>
                                            Remove Current Time Range
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Tooltip placement={'right'} title={<span style={{ fontSize: "20px"}}>Click to select and apply preset time range. There are 2 preset time ranges: AM Peak and PM Peak.</span>}>
                                <Grid item>
                                    <Grid container direction={"row"} alignContent="center" alignItems="center" spacing={1}>
                                        <Grid item>
                                            <h5>Apply Preset:</h5>
                                        </Grid>
                                        <Grid item>
                                            <Dropdown
                                                options={Presets.getPresets()}
                                                value={params.preset}
                                                onChange={this.updatePreset.bind(this)}
                                                className={"presets"}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Tooltip>


                            <Grid item>
                                <Grid container direction="row" alignContent="center" alignItems="flex-start"
                                      spacing={4}>
                                    <Grid item>
                                        <h5>Start Time</h5>
                                        <Tooltip title={<span style={{ fontSize: "20px"}}>Set the start time of the current time range in the format of HH:MM.</span>}>
                                            <TimePicker required={true}
                                                        format={"HH:mm"}
                                                        locale={"en-CA"}
                                                        maxDetail={"minute"}
                                                        disableClock={true}
                                                        value={params.startTime}
                                                        onChange={this.startTimeChange.bind(this)}
                                            />
                                        </Tooltip>
                                    </Grid>
                                    <Grid item>
                                        <h5 className={"endTimeLabel"}>End Time</h5>
                                        <Tooltip title={<span style={{ fontSize: "20px"}}>Set the end time of the current time range in the format of HH:MM.</span>}>
                                            <TimePicker required={true}
                                                        format={"HH:mm"}
                                                        locale={"en-CA"}
                                                        maxDetail={"minute"}
                                                        disableClock={true}
                                                        value={params.endTime}
                                                        onChange={this.endTimeChange.bind(this)}
                                            />
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>


                </Grid>
            </div>

        );

    }

}

export default SidebarContent;