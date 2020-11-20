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
import {DAYS_OF_WEEK_MAPPING, MAX_DATE, MIN_DATE} from "./Layout";


class SidebarContent extends React.Component {

    render() {
        let rangePickerOptions = [];
        for (let i = 0; i < this.props.dateTimeRanges; i++) {
            rangePickerOptions.push(`Range ${i + 1}`);
        }

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
                                    options={this.props.presets}
                                    placeholder={"Presets"}
                                    onChange={this.props.onPresetChange}
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
                                            value={this.props.startDate}
                                            onChange={this.props.onStartDateChange}
                                />
                            </Grid>

                            <Grid item>
                                <h5>End Date</h5>
                                <DatePicker required={true}
                                            locale={"en-CA"}
                                            maxDate={MAX_DATE}
                                            minDate={MIN_DATE}
                                            format={"y-MM-dd"}
                                            value={this.props.endDate}
                                            onChange={this.props.onEndDateChange}
                                />
                            </Grid>

                            <Grid item>
                                <h5>Start Time</h5>
                                <TimePicker required={true}
                                            format={"HH:mm"}
                                            locale={"en-CA"}
                                            maxDetail={"minute"}
                                            disableClock={true}
                                            value={this.props.startTime}
                                            onChange={this.props.onStartTimeChange}
                                />
                            </Grid>

                            <Grid item>
                                <h5 className={"endTimeLabel"}>End Time</h5>
                                <TimePicker required={true}
                                            format={"HH:mm"}
                                            locale={"en-CA"}
                                            maxDetail={"minute"}
                                            disableClock={true}
                                            value={this.props.endTime}
                                            onChange={this.props.onEndTimeChange}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Select Days of Week</FormLabel>
                            <FormGroup row>
                                <FormControlLabel
                                    control={<Checkbox checked={this.props.daysOfWeek[0]}
                                                       onChange={this.props.onDaysOfWeekChange.bind(this, 0)}
                                                       name={DAYS_OF_WEEK_MAPPING[0]}/>}
                                    label="Monday"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={this.props.daysOfWeek[1]}
                                                       onChange={this.props.onDaysOfWeekChange.bind(this, 1)}
                                                       name={DAYS_OF_WEEK_MAPPING[1]}/>}
                                    label="Tuesday"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={this.props.daysOfWeek[2]}
                                                       onChange={this.props.onDaysOfWeekChange.bind(this, 2)}
                                                       name={DAYS_OF_WEEK_MAPPING[2]}/>}
                                    label="Wednesday"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={this.props.daysOfWeek[3]}
                                                       onChange={this.props.onDaysOfWeekChange.bind(this, 3)}
                                                       name={DAYS_OF_WEEK_MAPPING[3]}/>}
                                    label="Thursday"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={this.props.daysOfWeek[4]}
                                                       onChange={this.props.onDaysOfWeekChange.bind(this, 4)}
                                                       name={DAYS_OF_WEEK_MAPPING[4]}/>}
                                    label="Friday"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={this.props.daysOfWeek[5]}
                                                       onChange={this.props.onDaysOfWeekChange.bind(this, 5)}
                                                       name={DAYS_OF_WEEK_MAPPING[5]}/>}
                                    label="Saturday"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={this.props.daysOfWeek[6]}
                                                       onChange={this.props.onDaysOfWeekChange.bind(this, 6)}
                                                       name={DAYS_OF_WEEK_MAPPING[6]}/>}
                                    label="Sunday"
                                />
                            </FormGroup>
                        </FormControl>
                    </Grid>

                    <Grid item>
                        <FormControlLabel
                            control={<Checkbox checked={this.props.includeHolidays}
                                               onChange={this.props.onHolidayUpdate}
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