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
import { MAX_DATE, MIN_DATE } from "./Range";
import Presets from "./Presets"
import Days from "./Days";


class SidebarContent extends React.Component {

    updatePreset(event){
        let choice = event.value;
        let params = this.props.activeRange.getParams();
        let newParams = Presets.getParams(choice);
        Object.assign(params, newParams);
        this.props.replaceActiveRange(params)
    }

    startDateChange(value){
        let params = this.props.activeRange.getParams();
        params.startDate = value;
        this.props.replaceActiveRange(params);
    }

    endDateChange(value){
        let params = this.props.activeRange.getParams();
        params.endDate = value;
        this.props.replaceActiveRange(params);
    }

    startTimeChange(value){
        let params = this.props.activeRange.getParams();
        let dateStr = '2020-01-01 '.concat(value).concat(':00');
        params.startTime = new Date(dateStr);
        this.props.replaceActiveRange(params)
    }

    endTimeChange(value){
        let params = this.props.activeRange.getParams();
        let dateStr = '2020-01-01 '.concat(value).concat(':00');
        params.endTime = new Date(dateStr);
        this.props.replaceActiveRange(params);
    }

    daysOfWeekChange(index){
        let params = this.props.activeRange.getParams();
        params.daysOfWeek[index] = !params.daysOfWeek[index];
        this.props.replaceActiveRange(params);
    }

    includeHolidaysChange(){
        let params = this.props.activeRange.getParams();
        params.includeHolidays = !params.includeHolidays;
        this.props.replaceActiveRange(params);
    }

    render() {
        let rangePickerOptions = [];
        for (let i = 0; i < this.props.dateTimeRanges; i++) {
            rangePickerOptions.push(`Range ${i + 1}`);
        }
        const params = this.props.activeRange.getParams();

        return (
            <div id="sidebar-container">
                <Grid container direction="column" alignItems="flex-start" alignContent="center" spacing={3}>
                    <Grid item>
                        <Grid container direction="row" alignItems="center" alignContent="center" spacing={2}>
                            <Grid item>
                                <h5>Current time range: </h5>
                            </Grid>
                            <Grid item>
                                <Dropdown
                                    options={rangePickerOptions}
                                    value={rangePickerOptions[this.props.range]}
                                    onChange={this.props.changeDateTimeRange}
                                />

                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <Grid container direction="column" alignContent="flex-start" alignItems="flex-start" spacing={1}>
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


                    <Grid item>
                        <Grid container direction={"row"} alignContent="center" alignItems="center" spacing={2}>
                            <Grid item>
                                <h5>Apply Preset:</h5>
                            </Grid>
                            <Grid item>
                                <Dropdown
                                    options={Presets.getPresets()}
                                    value={params.preset}
                                    onChange={this.updatePreset.bind(this)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <Grid container direction="column" alignContent="center" alignItems="flex-start" spacing={1}>
                            <Grid item>
                                <h5>Start Date</h5>
                                <DatePicker required={true} locale={"en-CA"}
                                            maxDate={MAX_DATE}
                                            minDate={MIN_DATE}
                                            format={"y-MM-dd"}
                                            value={params.startDate}
                                            onChange={this.startDateChange.bind(this)}
                                />
                            </Grid>

                            <Grid item>
                                <h5>End Date</h5>
                                <DatePicker required={true}
                                            locale={"en-CA"}
                                            maxDate={MAX_DATE}
                                            minDate={MIN_DATE}
                                            format={"y-MM-dd"}
                                            value={params.endDate}
                                            onChange={this.endDateChange.bind(this)}
                                />
                            </Grid>

                            <Grid item>
                                <h5>Start Time</h5>
                                <TimePicker required={true}
                                            format={"HH:mm"}
                                            locale={"en-CA"}
                                            maxDetail={"minute"}
                                            disableClock={true}
                                            value={params.startTime}
                                            onChange={this.startTimeChange.bind(this)}
                                />
                            </Grid>

                            <Grid item>
                                <h5 className={"endTimeLabel"}>End Time</h5>
                                <TimePicker required={true}
                                            format={"HH:mm"}
                                            locale={"en-CA"}
                                            maxDetail={"minute"}
                                            disableClock={true}
                                            value={params.endTime}
                                            onChange={this.endTimeChange.bind(this)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item>
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
                    </Grid>

                    <Grid item>
                        <FormControlLabel
                            control={<Checkbox checked={params.includeHolidays}
                                               onChange={this.includeHolidaysChange.bind(this)}
                                               name={"holiday"}/>}
                            label="Include Holidays"
                        />
                    </Grid>

                    <Grid item>
                        <div
                            ref={React.createRef()}>
                            File Type:
                            <Select
                                native
                                defaultValue={"csv"}
                                onChange={this.props.onFileTypeUpdate}
                            >
                                <option value={"csv"}>csv</option>
                                <option value={"xlsx-time"}>xlsx (worksheet by time period)</option>
                                <option value={"xlsx-seg"}>xlsx (worksheet by segments)</option>
                                <option value={"xlsx-none"}>xlsx (single worksheet)</option>
                            </Select>
                        </div>
                    </Grid>

                    <Grid item>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={this.props.onGo}
                            disabled={this.props.disableGetButton}
                        >{this.props.disableGetButton ? `Please Wait` : `Get Displayed Links' Data`}
                        </Button>
                    </Grid>


                </Grid>
            </div>

        );

    }

}

export default SidebarContent;