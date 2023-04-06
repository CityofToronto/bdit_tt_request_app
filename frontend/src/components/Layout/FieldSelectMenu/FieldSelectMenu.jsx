import React from "react"
import FormControl from "@material-ui/core/FormControl"
import FormGroup from "@material-ui/core/FormGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import {Button, Checkbox} from "@material-ui/core"
import Grid from "@material-ui/core/Grid"
import "./FieldSelectMenu.css"

export const fields = [
    { label:'mean travel time', column:'mean_tt' },
    { label:'min travel time', column:'min_tt' },
    { label:'max travel time', column:'max_tt' },
    { label:'travel time standard deviation', column:'std_dev' }
]

export default class FieldSelectMenu extends React.Component {
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
                                { fields.map( (field,i) => (
                                    <FormControlLabel key={i}
                                        control={
                                            <Checkbox
                                                checked={fileParams.fields[i]}
                                                onChange={this.fieldsChange.bind(this, i)}
                                                name={field.column}
                                            />
                                        }
                                        label={field.column}
                                    />
                                ) ) }
                            </FormGroup>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <Button 
                            onClick={this.props.handleClose} 
                            variant="contained" 
                            color="primary"
                            className={"done-button"}
                        >
                            Done
                        </Button>
                    </Grid>
                </Grid>
            </div>

        );
    }
}