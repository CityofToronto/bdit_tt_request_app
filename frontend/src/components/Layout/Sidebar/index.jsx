import React from "react"
import Dropdown from "react-dropdown"
import { Button, Checkbox, Grid, Select } from "@material-ui/core"
import "react-dropdown/style.css"
import "./SidebarContent.css"
import DatePicker from "react-date-picker"
import TimePicker from 'react-time-picker'
import FormLabel from "@material-ui/core/FormLabel"
import FormControl from "@material-ui/core/FormControl"
import FormGroup from "@material-ui/core/FormGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Presets from "../Datetime/Presets"
import { days } from "../Settings/Days"
import { getDateBoundaries } from '../../../actions'

export default class SidebarContent extends React.Component {
    constructor(props){
    super(props)
        this.state = {
            endDate: null,
            startDate: null
        }
    }
    componentDidMount(){
        getDateBoundaries().then( ({endDate,startDate}) => {
            this.setState({endDate,startDate})
        } )
    }

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
        const rangeParams = this.props.activeRange.getParams()
        const fileParams = this.props.fileSettings.getParams()
        let params = {...rangeParams, ...fileParams}
        return (
            <div id="sidebar-container">
                <Grid container direction="column" alignItems="flex-start" alignContent="center" spacing={3}>
                    <Grid item>
                        <Grid container direction="column" alignItems="center" alignContent="center" spacing={2}>
                            <Grid item>
                                <div ref={React.createRef()}>
                                    File Type: &nbsp;
                                    <Select native value={params.fileType} onChange={this.fileTypeChange.bind(this)}>
                                        <option value={"geojson"}>GeoJSON (geometries only)</option>
                                        <option value={"csv"}>CSV (data tables)</option>
                                        {false && <option value={"xlsx"}>Excel (data tables)</option>}
                                    </Select>
                                </div>
                            </Grid>

                            <Grid item>
                                <Button
                                    variant="contained" color="primary" className={"download"}
                                    onClick={this.props.onGo}
                                    disabled={this.props.disableGetButton}
                                >
                                    {this.props.disableGetButton ? `Please Wait` : `Download Travel Time Data`}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <Grid container direction="row" alignContent="center" alignItems="flex-start" spacing={5}>
                            <Grid item>
                                <h5>Start Date</h5>
                                <DatePicker 
                                    required={true} 
                                    locale={"en-CA"}
                                    maxDate={this.state.endDate}
                                    minDate={this.state.startDate}
                                    format={"y-MM-dd"}
                                    value={params.startDate}
                                    onChange={this.startDateChange.bind(this)}
                                />
                            </Grid>
                            <Grid item>
                                <h5>End Date</h5>
                                <DatePicker 
                                    required={true}
                                    locale={"en-CA"}
                                    maxDate={this.state.endDate}
                                    minDate={this.state.startDate}
                                    format={"y-MM-dd"}
                                    value={params.endDate}
                                    onChange={this.endDateChange.bind(this)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Select Days of Week</FormLabel>
                            <FormGroup row>
                                {days.map( ({name,number}) => (
                                    <FormControlLabel key={number}
                                        control={
                                            <Checkbox 
                                                checked={params.daysOfWeek[number]}
                                                onChange={this.daysOfWeekChange.bind(this, number)}
                                                name={name}
                                            />
                                        }
                                        label={name}
                                    />
                                ) ) }
                            </FormGroup>
                        </FormControl>
                    </Grid>

                    <Grid item>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={params.includeHolidays}
                                    onChange={this.includeHolidaysChange.bind(this)}
                                    name={"holiday"}
                                />
                            }
                            label="Include Holidays"
                        />
                    </Grid>

                    <Grid item>
                        <Grid container direction="column" alignItems="flex-start" alignContent="center" spacing={1}>
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

                            <Grid item>
                                <Grid container direction="column" alignContent="flex-start" alignItems="flex-start" spacing={1}>
                                    <Grid item>
                                        <Button 
                                            variant="outlined" color="primary" size="small"
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

                            <Grid item>
                                <Grid container direction={"row"} alignContent="center" alignItems="center"
                                      spacing={1}>
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

                            <Grid item>
                                <Grid container direction="row" alignContent="center" alignItems="flex-start"
                                      spacing={4}>
                                    <Grid item>
                                        <h5>Start Time (inclusive)</h5>
                                        <TimePicker 
                                            required={true}
                                            format={"HH:mm"}
                                            locale={"en-CA"}
                                            maxDetail={"minute"}
                                            disableClock={true}
                                            value={!isNaN(params.startTime)?params.startTime:"00:00"}
                                            onChange={this.startTimeChange.bind(this)}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <h5 className={"endTimeLabel"}>End Time (exclusive)</h5>
                                        <TimePicker
                                            required={true}
                                            format={"HH:mm"}
                                            locale={"en-CA"}
                                            maxDetail={"minute"}
                                            disableClock={true}
                                            value={!isNaN(params.endTime)?params.endTime:"00:00"}
                                            onChange={this.endTimeChange.bind(this)}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>

        )

    }

}
