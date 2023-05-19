import React from "react"
import { 
	FormControl, FormGroup, Grid, Tooltip,
	FormControlLabel, Button, Checkbox 
} from "@mui/material"
import "./FieldSelectMenu.css"

export const VALID_COLUMN_NAMES = ['mean_tt', 'min_tt',
    'max_tt', 'pct_5_tt', 'pct_10_tt', 'pct_15_tt', 'pct_20_tt', 'pct_25_tt', 'pct_30_tt', 'pct_35_tt', 'pct_40_tt',
    'pct_45_tt', 'pct_50_tt', 'pct_55_tt', 'pct_60_tt', 'pct_65_tt', 'pct_70_tt', 'pct_75_tt', 'pct_80_tt',
    'pct_85_tt', 'pct_90_tt', 'pct_95_tt', 'std_dev', 'min_spd', 'mean_spd', 'max_spd', 'total_length',
    'days_of_data', 'requested_days', 'prop_5min']
export const COLUMN_NAME_TOOLTIP_TEXT = ['mean travel time', 'min travel time', 'max travel time',
    '5th percentile travel time by day', '10th percentile travel time by day', '15th percentile travel time by day',
    '20th percentile travel time by day', '25th percentile travel time by day', '30th percentile travel time by day',
    '35th percentile travel time by day', '40th percentile travel time by day', '45th percentile travel time by day',
    '50th percentile travel time by day', '55th percentile travel time by day', '60th percentile travel time by day',
    '65th percentile travel time by day', '70th percentile travel time by day', '75th percentile travel time by day',
    '80th percentile travel time by day', '85th percentile travel time by day', '90th percentile travel time by day',
    '95th percentile travel time by day', 'travel time standard deviation', 'minimum travel speed', 'mean travel speed',
    'maximum travel speed', 'total length', 'number of valid days of data used for aggregation',
    'number of possible days of data based on the requested parameters',
    'proportion of the requested time period for which there were 5-minute resolution observations']

class FieldSelectMenu extends React.Component {
    fieldsChange(index) {
        let params = this.props.fileSettings.getParams();
        let newFields = [...params.fields];
        newFields[index] = !newFields[index];
        params.fields = newFields;
        this.props.replaceSettings(params);
    }

    selectAll() {
        let params = this.props.fileSettings.getParams();
        let newFields = [...params.fields];
        newFields.forEach((field, i) => {
            newFields[i] = true
        })
        params.fields = newFields;
        this.props.replaceSettings(params);
    }

    render() {
        let fileParams = this.props.fileSettings.getParams();
        return (
            <div id={"field-select-menu"}>
                <Grid container direction="column" alignContent="flex-start" alignItems="flex-start" spacing={4}>
                    <Grid item>
                        <h3>Travel Time (minutes)</h3>
                        <FormControl>
                            <FormGroup row>
                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[0]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[0]}
                                                       onChange={this.fieldsChange.bind(this, 0)}
                                                       name={VALID_COLUMN_NAMES[0]}/>}
                                    label={VALID_COLUMN_NAMES[0]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[1]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[1]}
                                                       onChange={this.fieldsChange.bind(this, 1)}
                                                       name={VALID_COLUMN_NAMES[1]}/>}
                                    label={VALID_COLUMN_NAMES[1]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[2]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[2]}
                                                       onChange={this.fieldsChange.bind(this, 2)}
                                                       name={VALID_COLUMN_NAMES[2]}/>}
                                    label={VALID_COLUMN_NAMES[2]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[22]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[22]}
                                                       onChange={this.fieldsChange.bind(this, 22)}
                                                       name={VALID_COLUMN_NAMES[22]}/>}
                                    label={VALID_COLUMN_NAMES[22]}
                                />
                                </Tooltip>
                            </FormGroup>
                        </FormControl>
                        <FormControl>
                            <FormGroup row>
                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[3]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[3]}
                                                       onChange={this.fieldsChange.bind(this, 3)}
                                                       name={VALID_COLUMN_NAMES[3]}/>}
                                    label={VALID_COLUMN_NAMES[3]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[4]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[4]}
                                                       onChange={this.fieldsChange.bind(this, 4)}
                                                       name={VALID_COLUMN_NAMES[4]}/>}
                                    label={VALID_COLUMN_NAMES[4]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[5]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[5]}
                                                       onChange={this.fieldsChange.bind(this, 5)}
                                                       name={VALID_COLUMN_NAMES[5]}/>}
                                    label={VALID_COLUMN_NAMES[5]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[6]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[6]}
                                                       onChange={this.fieldsChange.bind(this, 6)}
                                                       name={VALID_COLUMN_NAMES[6]}/>}
                                    label={VALID_COLUMN_NAMES[6]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[7]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[7]}
                                                       onChange={this.fieldsChange.bind(this, 7)}
                                                       name={VALID_COLUMN_NAMES[7]}/>}
                                    label={VALID_COLUMN_NAMES[7]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[8]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[8]}
                                                       onChange={this.fieldsChange.bind(this, 8)}
                                                       name={VALID_COLUMN_NAMES[8]}/>}
                                    label={VALID_COLUMN_NAMES[8]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[9]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[9]}
                                                       onChange={this.fieldsChange.bind(this, 9)}
                                                       name={VALID_COLUMN_NAMES[9]}/>}
                                    label={VALID_COLUMN_NAMES[9]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[10]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[10]}
                                                       onChange={this.fieldsChange.bind(this, 10)}
                                                       name={VALID_COLUMN_NAMES[10]}/>}
                                    label={VALID_COLUMN_NAMES[10]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[11]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[11]}
                                                       onChange={this.fieldsChange.bind(this, 11)}
                                                       name={VALID_COLUMN_NAMES[11]}/>}
                                    label={VALID_COLUMN_NAMES[11]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[12]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[12]}
                                                       onChange={this.fieldsChange.bind(this, 12)}
                                                       name={VALID_COLUMN_NAMES[12]}/>}
                                    label={VALID_COLUMN_NAMES[12]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[13]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[13]}
                                                       onChange={this.fieldsChange.bind(this, 13)}
                                                       name={VALID_COLUMN_NAMES[13]}/>}
                                    label={VALID_COLUMN_NAMES[13]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[14]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[14]}
                                                       onChange={this.fieldsChange.bind(this, 14)}
                                                       name={VALID_COLUMN_NAMES[14]}/>}
                                    label={VALID_COLUMN_NAMES[14]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[15]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[15]}
                                                       onChange={this.fieldsChange.bind(this, 15)}
                                                       name={VALID_COLUMN_NAMES[15]}/>}
                                    label={VALID_COLUMN_NAMES[15]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[16]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[16]}
                                                       onChange={this.fieldsChange.bind(this, 16)}
                                                       name={VALID_COLUMN_NAMES[16]}/>}
                                    label={VALID_COLUMN_NAMES[16]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[17]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[17]}
                                                       onChange={this.fieldsChange.bind(this, 17)}
                                                       name={VALID_COLUMN_NAMES[17]}/>}
                                    label={VALID_COLUMN_NAMES[17]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[18]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[18]}
                                                       onChange={this.fieldsChange.bind(this, 18)}
                                                       name={VALID_COLUMN_NAMES[18]}/>}
                                    label={VALID_COLUMN_NAMES[18]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[19]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[19]}
                                                       onChange={this.fieldsChange.bind(this, 19)}
                                                       name={VALID_COLUMN_NAMES[19]}/>}
                                    label={VALID_COLUMN_NAMES[19]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[20]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[20]}
                                                       onChange={this.fieldsChange.bind(this, 20)}
                                                       name={VALID_COLUMN_NAMES[20]}/>}
                                    label={VALID_COLUMN_NAMES[20]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[21]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[21]}
                                                       onChange={this.fieldsChange.bind(this, 21)}
                                                       name={VALID_COLUMN_NAMES[21]}/>}
                                    label={VALID_COLUMN_NAMES[21]}
                                />
                                </Tooltip>
                            </FormGroup>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <h3>Speed</h3>
                        <FormControl>
                            <FormGroup row>
                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[23]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[23]}
                                                       onChange={this.fieldsChange.bind(this, 23)}
                                                       name={VALID_COLUMN_NAMES[23]}/>}
                                    label={VALID_COLUMN_NAMES[23]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[24]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[24]}
                                                       onChange={this.fieldsChange.bind(this, 24)}
                                                       name={VALID_COLUMN_NAMES[24]}/>}
                                    label={VALID_COLUMN_NAMES[24]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[25]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[25]}
                                                       onChange={this.fieldsChange.bind(this, 25)}
                                                       name={VALID_COLUMN_NAMES[25]}/>}
                                    label={VALID_COLUMN_NAMES[25]}
                                />
                                </Tooltip>

                            </FormGroup>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <h3>Miscellaneous</h3>
                        <FormControl>
                            <FormGroup row>
                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[26]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[26]}
                                                       onChange={this.fieldsChange.bind(this, 26)}
                                                       name={VALID_COLUMN_NAMES[26]}/>}
                                    label={VALID_COLUMN_NAMES[26]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[27]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[27]}
                                                       onChange={this.fieldsChange.bind(this, 27)}
                                                       name={VALID_COLUMN_NAMES[27]}/>}
                                    label={VALID_COLUMN_NAMES[27]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[28]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[28]}
                                                       onChange={this.fieldsChange.bind(this, 28)}
                                                       name={VALID_COLUMN_NAMES[28]}/>}
                                    label={VALID_COLUMN_NAMES[28]}
                                />
                                </Tooltip>

                                <Tooltip placement={'right'} title={<span style={{fontSize: "20px"}}>
                                    {COLUMN_NAME_TOOLTIP_TEXT[29]}
                                </span>}><FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[29]}
                                                       onChange={this.fieldsChange.bind(this, 29)}
                                                       name={VALID_COLUMN_NAMES[29]}/>}
                                    label={VALID_COLUMN_NAMES[29]}
                                />
                                </Tooltip>
                            </FormGroup>
                        </FormControl>
                    </Grid>

                    <Grid item>
                        <Button onClick={this.props.handleClose} variant="contained" color="primary"
                                className={"done-button"}>
                            Done
                        </Button>
                    </Grid>
                </Grid>
            </div>

        );
    }
}

export default FieldSelectMenu;
