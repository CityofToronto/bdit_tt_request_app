import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {Button, Checkbox} from "@material-ui/core";
import React from "react";
import "./FieldSelectMenu.css"

class FieldSelectMenu extends React.Component{
    fieldsChange(index){
        let params = this.props.fileSettings.getParams();
        let newFields = [...params.fields];
        newFields[index] = !newFields[index];
        params.fields = newFields;
        this.props.replaceSettings(params);
    }

    render(){
        let fileParams = this.props.fileSettings.getParams();
        return (
            <div>
                <FormControl>
                    <FormGroup row>

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[0]}
                                               onChange={this.fieldsChange.bind(this, 0)}
                                               name={"mean_tt"}/>}
                            label="mean_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[1]}
                                               onChange={this.fieldsChange.bind(this, 1)}
                                               name={"min_tt"}/>}
                            label="min_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[2]}
                                               onChange={this.fieldsChange.bind(this, 2)}
                                               name={"pct_5_tt"}/>}
                            label="pct_5_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[3]}
                                               onChange={this.fieldsChange.bind(this, 3)}
                                               name={"pct_10_tt"}/>}
                            label="pct_10_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[4]}
                                               onChange={this.fieldsChange.bind(this, 4)}
                                               name={"pct_15_tt"}/>}
                            label="pct_15_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[5]}
                                               onChange={this.fieldsChange.bind(this, 5)}
                                               name={"pct_20_tt"}/>}
                            label="pct_20_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[6]}
                                               onChange={this.fieldsChange.bind(this, 6)}
                                               name={"pct_25_tt"}/>}
                            label="pct_25_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[7]}
                                               onChange={this.fieldsChange.bind(this, 7)}
                                               name={"pct_30_tt"}/>}
                            label="pct_30_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[8]}
                                               onChange={this.fieldsChange.bind(this, 8)}
                                               name={"pct_35_tt"}/>}
                            label="pct_35_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[9]}
                                               onChange={this.fieldsChange.bind(this, 9)}
                                               name={"pct_40_tt"}/>}
                            label="pct_40_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[10]}
                                               onChange={this.fieldsChange.bind(this, 10)}
                                               name={"pct_45_tt"}/>}
                            label="pct_45_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[11]}
                                               onChange={this.fieldsChange.bind(this, 11)}
                                               name={"pct_50_tt"}/>}
                            label="pct_50_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[12]}
                                               onChange={this.fieldsChange.bind(this, 12)}
                                               name={"pct_55_tt"}/>}
                            label="pct_55_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[13]}
                                               onChange={this.fieldsChange.bind(this, 13)}
                                               name={"pct_60_tt"}/>}
                            label="pct_60_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[14]}
                                               onChange={this.fieldsChange.bind(this, 14)}
                                               name={"pct_65_tt"}/>}
                            label="pct_65_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[15]}
                                               onChange={this.fieldsChange.bind(this, 15)}
                                               name={"pct_70_tt"}/>}
                            label="pct_70_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[16]}
                                               onChange={this.fieldsChange.bind(this, 16)}
                                               name={"pct_75_tt"}/>}
                            label="pct_75_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[17]}
                                               onChange={this.fieldsChange.bind(this, 17)}
                                               name={"pct_80_tt"}/>}
                            label="pct_80_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[18]}
                                               onChange={this.fieldsChange.bind(this, 18)}
                                               name={"pct_85_tt"}/>}
                            label="pct_85_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[19]}
                                               onChange={this.fieldsChange.bind(this, 19)}
                                               name={"pct_90_tt"}/>}
                            label="pct_90_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[20]}
                                               onChange={this.fieldsChange.bind(this, 20)}
                                               name={"pct_95_tt"}/>}
                            label="pct_95_tt"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[21]}
                                               onChange={this.fieldsChange.bind(this, 21)}
                                               name={"std_dev"}/>}
                            label="std_dev"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[22]}
                                               onChange={this.fieldsChange.bind(this, 22)}
                                               name={"min_spd"}/>}
                            label="min_spd"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[23]}
                                               onChange={this.fieldsChange.bind(this, 23)}
                                               name={"mean_spd"}/>}
                            label="mean_spd"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[24]}
                                               onChange={this.fieldsChange.bind(this, 24)}
                                               name={"max_spd"}/>}
                            label="max_spd"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[25]}
                                               onChange={this.fieldsChange.bind(this, 25)}
                                               name={"total_length"}/>}
                            label="total_length"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[26]}
                                               onChange={this.fieldsChange.bind(this, 26)}
                                               name={"days_of_data"}/>}
                            label="days_of_data"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[27]}
                                               onChange={this.fieldsChange.bind(this, 27)}
                                               name={"requested_days"}/>}
                            label="requested_days"
                        />

                        <FormControlLabel
                            control={<Checkbox checked={fileParams.fields[28]}
                                               onChange={this.fieldsChange.bind(this, 28)}
                                               name={"prop_5min"}/>}
                            label="prop_5min"
                        />
                    </FormGroup>
                </FormControl>
                <Button onClick={this.props.handleClose} variant="contained" color="primary" className={"done"}>
                    Done
                </Button>
            </div>

        );
    }
}

export default FieldSelectMenu;