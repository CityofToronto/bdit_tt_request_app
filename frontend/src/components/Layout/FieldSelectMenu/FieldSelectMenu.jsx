import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {Button, Checkbox} from "@material-ui/core";
import React from "react";
import "./FieldSelectMenu.css"
import Grid from "@material-ui/core/Grid";

export const VALID_COLUMN_NAMES = ['mean_tt', 'min_tt',
    'max_tt', 'pct_5_tt', 'pct_10_tt', 'pct_15_tt', 'pct_20_tt', 'pct_25_tt', 'pct_30_tt', 'pct_35_tt', 'pct_40_tt',
    'pct_45_tt', 'pct_50_tt', 'pct_55_tt', 'pct_60_tt', 'pct_65_tt', 'pct_70_tt', 'pct_75_tt', 'pct_80_tt',
    'pct_85_tt', 'pct_90_tt', 'pct_95_tt', 'std_dev', 'min_spd', 'mean_spd', 'max_spd', 'total_length',
    'days_of_data', 'requested_days', 'prop_5min']

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
                        <FormControl>
                            <FormGroup row>
                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[0]}
                                                       onChange={this.fieldsChange.bind(this, 0)}
                                                       name={VALID_COLUMN_NAMES[0]}/>}
                                    label={VALID_COLUMN_NAMES[0]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[1]}
                                                       onChange={this.fieldsChange.bind(this, 1)}
                                                       name={VALID_COLUMN_NAMES[1]}/>}
                                    label={VALID_COLUMN_NAMES[1]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[2]}
                                                       onChange={this.fieldsChange.bind(this, 2)}
                                                       name={VALID_COLUMN_NAMES[2]}/>}
                                    label={VALID_COLUMN_NAMES[2]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[3]}
                                                       onChange={this.fieldsChange.bind(this, 3)}
                                                       name={VALID_COLUMN_NAMES[3]}/>}
                                    label={VALID_COLUMN_NAMES[3]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[4]}
                                                       onChange={this.fieldsChange.bind(this, 4)}
                                                       name={VALID_COLUMN_NAMES[4]}/>}
                                    label={VALID_COLUMN_NAMES[4]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[5]}
                                                       onChange={this.fieldsChange.bind(this, 5)}
                                                       name={VALID_COLUMN_NAMES[5]}/>}
                                    label={VALID_COLUMN_NAMES[5]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[6]}
                                                       onChange={this.fieldsChange.bind(this, 6)}
                                                       name={VALID_COLUMN_NAMES[6]}/>}
                                    label={VALID_COLUMN_NAMES[6]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[7]}
                                                       onChange={this.fieldsChange.bind(this, 7)}
                                                       name={VALID_COLUMN_NAMES[7]}/>}
                                    label={VALID_COLUMN_NAMES[7]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[8]}
                                                       onChange={this.fieldsChange.bind(this, 8)}
                                                       name={VALID_COLUMN_NAMES[8]}/>}
                                    label={VALID_COLUMN_NAMES[8]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[9]}
                                                       onChange={this.fieldsChange.bind(this, 9)}
                                                       name={VALID_COLUMN_NAMES[9]}/>}
                                    label={VALID_COLUMN_NAMES[9]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[10]}
                                                       onChange={this.fieldsChange.bind(this, 10)}
                                                       name={VALID_COLUMN_NAMES[10]}/>}
                                    label={VALID_COLUMN_NAMES[10]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[11]}
                                                       onChange={this.fieldsChange.bind(this, 11)}
                                                       name={VALID_COLUMN_NAMES[11]}/>}
                                    label={VALID_COLUMN_NAMES[11]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[12]}
                                                       onChange={this.fieldsChange.bind(this, 12)}
                                                       name={VALID_COLUMN_NAMES[12]}/>}
                                    label={VALID_COLUMN_NAMES[12]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[13]}
                                                       onChange={this.fieldsChange.bind(this, 13)}
                                                       name={VALID_COLUMN_NAMES[13]}/>}
                                    label={VALID_COLUMN_NAMES[13]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[14]}
                                                       onChange={this.fieldsChange.bind(this, 14)}
                                                       name={VALID_COLUMN_NAMES[14]}/>}
                                    label={VALID_COLUMN_NAMES[14]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[15]}
                                                       onChange={this.fieldsChange.bind(this, 15)}
                                                       name={VALID_COLUMN_NAMES[15]}/>}
                                    label={VALID_COLUMN_NAMES[15]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[16]}
                                                       onChange={this.fieldsChange.bind(this, 16)}
                                                       name={VALID_COLUMN_NAMES[16]}/>}
                                    label={VALID_COLUMN_NAMES[16]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[17]}
                                                       onChange={this.fieldsChange.bind(this, 17)}
                                                       name={VALID_COLUMN_NAMES[17]}/>}
                                    label={VALID_COLUMN_NAMES[17]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[18]}
                                                       onChange={this.fieldsChange.bind(this, 18)}
                                                       name={VALID_COLUMN_NAMES[18]}/>}
                                    label={VALID_COLUMN_NAMES[18]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[19]}
                                                       onChange={this.fieldsChange.bind(this, 19)}
                                                       name={VALID_COLUMN_NAMES[19]}/>}
                                    label={VALID_COLUMN_NAMES[19]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[20]}
                                                       onChange={this.fieldsChange.bind(this, 20)}
                                                       name={VALID_COLUMN_NAMES[20]}/>}
                                    label={VALID_COLUMN_NAMES[20]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[21]}
                                                       onChange={this.fieldsChange.bind(this, 21)}
                                                       name={VALID_COLUMN_NAMES[21]}/>}
                                    label={VALID_COLUMN_NAMES[21]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[22]}
                                                       onChange={this.fieldsChange.bind(this, 22)}
                                                       name={VALID_COLUMN_NAMES[22]}/>}
                                    label={VALID_COLUMN_NAMES[22]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[23]}
                                                       onChange={this.fieldsChange.bind(this, 23)}
                                                       name={VALID_COLUMN_NAMES[23]}/>}
                                    label={VALID_COLUMN_NAMES[23]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[24]}
                                                       onChange={this.fieldsChange.bind(this, 24)}
                                                       name={VALID_COLUMN_NAMES[24]}/>}
                                    label={VALID_COLUMN_NAMES[24]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[25]}
                                                       onChange={this.fieldsChange.bind(this, 25)}
                                                       name={VALID_COLUMN_NAMES[25]}/>}
                                    label={VALID_COLUMN_NAMES[25]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[26]}
                                                       onChange={this.fieldsChange.bind(this, 26)}
                                                       name={VALID_COLUMN_NAMES[26]}/>}
                                    label={VALID_COLUMN_NAMES[26]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[27]}
                                                       onChange={this.fieldsChange.bind(this, 27)}
                                                       name={VALID_COLUMN_NAMES[27]}/>}
                                    label={VALID_COLUMN_NAMES[27]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[28]}
                                                       onChange={this.fieldsChange.bind(this, 28)}
                                                       name={VALID_COLUMN_NAMES[28]}/>}
                                    label={VALID_COLUMN_NAMES[28]}
                                />

                                <FormControlLabel
                                    control={<Checkbox checked={fileParams.fields[29]}
                                                       onChange={this.fieldsChange.bind(this, 29)}
                                                       name={VALID_COLUMN_NAMES[29]}/>}
                                    label={VALID_COLUMN_NAMES[29]}
                                />
                            </FormGroup>
                        </FormControl>
                    </Grid>

                    <Grid item>
                        <Button onClick={this.selectAll.bind(this)} variant="contained" color="primary" className={"select-all-button"}>
                            Select All
                        </Button>
                        <Button onClick={this.props.handleClose} variant="contained" color="primary" className={"done-button"}>
                            Done
                        </Button>
                    </Grid>
                </Grid>
            </div>

        );
    }
}

export default FieldSelectMenu;