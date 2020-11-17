import React from "react";
import Dropdown from "react-dropdown";
import {Checkbox, Select} from "@material-ui/core";
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
         for(let i = 0; i < this.props.dateTimeRanges; i++){
             rangePickerOptions.push(`Range ${i+1}`);
         }

        return (

            <div id={"contentContainer"}
                 className={"contentContainer"}>


                <Dropdown
                    options={rangePickerOptions}
                    value={rangePickerOptions[this.props.range]}
                    onChange={this.props.changeDateTimeRange}
                    className={"rangeSelector"}
                    id={"rangeSelector"}
                />

                <button
                    className={"newRange"}
                    id={"newRange"}
                    onClick={this.props.addNewRange}
                >Add New Range</button>

                <Dropdown
                    options={this.props.presets}
                    placeholder={"Presets"}
                    onChange={this.props.onPresetChange}
                    className={"presets"}
                    id={"presets"}
                />
                <div
                    className={"startDateContainer"}
                    id={"startDateContainer"}
                >
                    <h5 className={"startDateLabel"}>Start Date</h5>
                    <DatePicker required={true} locale={"en-CA"}
                                className={"startDate"}
                                maxDate={MAX_DATE}
                                minDate={MIN_DATE}
                                format={"y:MM:dd"}
                                value={this.props.startDate}
                                onChange={this.props.onStartDateChange}
                    />
                </div>
                
                <div
                    className={"endDateContainer"}
                    id={"endDateContainer"}
                >
                    <h5 className={"endDateLabel"}>End Date</h5>
                    <DatePicker required={true}
                                locale={"en-CA"}
                                className={"endDate"}
                                maxDate={MAX_DATE}
                                minDate={MIN_DATE}
                                format={"y:MM:dd"}
                                value={this.props.endDate}
                                onChange={this.props.onEndDateChange}
                    />
                </div>
            
                <div
                    className={"startTimeContainer"}
                    id={"startTimeContainer"}
                >
                    <h5 className={"startTimeLabel"}>Start Time</h5>
                    <TimePicker required={true}
                                format={"HH:mm:ss"}
                                locale={"en-CA"}
                                className={"startTime"}
                                maxDetail={"second"}
                                value={this.props.startTime}
                                onChange={this.props.onStartTimeChange}
                    />
                </div>

                <div
                    className={"endTimeContainer"}
                    id={"endTimeContainer"}
                >
                    <h5 className={"endTimeLabel"}>End Time</h5>
                    <TimePicker required={true}
                                format={"HH:mm:ss"}
                                locale={"en-CA"}
                                className={"endTime"}
                                maxDetail={"second"}
                                value={this.props.endTime}
                                onChange={this.props.onEndTimeChange}
                    />
                </div>

                <FormControl component="fieldset"
                             className={"days"}
                             id={"days"}>
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
                    className={"holiday"}
                    id={"holiday"}
                    control={<Checkbox checked={this.props.includeHolidays}
                                       onChange={this.props.onHolidayUpdate}
                                       name={"holiday"}/>}
                    label="Include Holidays"
                />

                <div
                className={"fileTypeContainer"}
                id={"fileTypeContainer"}
                ref={React.createRef()}>
                    Select File Type:
                    <Select
                        native
                        className={"fileType"}
                        id={"fileType"}
                        defaultValue={"csv"}
                        onChange={this.props.onFileTypeUpdate}
                    >
                        <option value={"csv"}>csv</option>
                        <option value={"xlsx"}>xlsx</option>
                    </Select>
                </div>

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