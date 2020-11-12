import React from "react";
import Dropdown from "react-dropdown";
import {Checkbox} from "@material-ui/core";
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

        return (

            <div id={"contentContainer"} className={"contentContainer"}>

                <Dropdown
                    options={this.props.presets}
                    placeholder={"Presets"}
                    onChange={this.props.onPresetChange}
                    className={"presets"}
                    id={"presets"}
                />
                {/*<TextField*/}
                {/*    label="time"*/}
                {/*    id="time"*/}
                {/*    className={"time"}*/}
                {/*    onChange={this.props.onTimesUpdate}*/}
                {/*    value={this.props.timeRange}*/}
                {/*    helperText={"e.g. 0600:0900"}*/}
                {/*/>*/}
                {/*<TextField*/}
                {/*    label="dates"*/}
                {/*    id="date"*/}
                {/*    className={"date"}*/}
                {/*    onChange={this.props.onDatesUpdate}*/}
                {/*    value={this.props.dateRange}*/}
                {/*    helperText={"e.g. 2020-01-01:2020-0201"}*/}
                {/*/>*/}
                {/*<TextField*/}
                {/*    label="days"*/}
                {/*    id="days"*/}
                {/*    className={"days"}*/}
                {/*    onChange={this.props.onDaysUpdate}*/}
                {/*    helperText={"e.g. mon:fri"}*/}
                {/*    value={this.props.dayRange}*/}
                {/*/>*/}
                <DatePicker required={true} locale={"en-CA"} className={"startDate"}
                            maxDate={MAX_DATE} minDate={MIN_DATE} format={"y:MM:dd"}
                            value={this.props.startDate} onChange={this.props.onStartDateChange}/>

                <DatePicker required={true} locale={"en-CA"} className={"endDate"}
                            maxDate={MAX_DATE} minDate={MIN_DATE} format={"y:MM:dd"}
                            value={this.props.endDate} onChange={this.props.onEndDateChange}/>

                <TimePicker required={true} format={"HH:mm:ss"} locale={"en-CA"} className={"startTime"}
                            maxDetail={"second"} value={this.props.startTime} onChange={this.props.onStartTimeChange}/>

                <TimePicker required={true} format={"HH:mm:ss"} locale={"en-CA"} className={"endTime"}
                            maxDetail={"second"} value={this.props.endTime} onChange={this.props.onEndTimeChange}/>

                <FormControl component="fieldset" className={"days"} id={"days"}>
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

                <FormControlLabel
                    className={"holiday"} id={"holiday"}
                    control={<Checkbox checked={this.props.includeHolidays}
                                       onChange={this.props.onHolidayUpdate}
                                       name={"holiday"}/>}
                    label="Include Holidays"
                />

                {/*<Checkbox*/}
                {/*    checked={this.props.includeHolidays}*/}
                {/*    onClick={this.props.onHolidayUpdate}*/}
                {/*    inputProps={{ 'aria-label': 'primary checkbox' }}*/}
                {/*    id={"holiday"}*/}
                {/*    className={"holiday"}*/}
                {/*/>*/}
                {/*<p id={"label"} className={"label"}>Include Holidays</p>*/}
                <button
                    id={"go"}
                    className={"go"}
                    onClick={this.props.onGo}
                >GO
                </button>
            </div>
        );

    }

}

export default SidebarContent;