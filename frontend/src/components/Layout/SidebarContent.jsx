import React from "react";
import Dropdown from "react-dropdown";
import { TextField } from "@material-ui/core";
import { Checkbox } from "@material-ui/core";
import "react-dropdown/style.css";
import "./SidebarContent.css";

class SidebarContent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            timeRange: "",
            dateRange: "",
            dayRange: "",
            includeHolidays: false
        }
    }

    updatePreset = (event) => {
        console.log(event);
        switch(event.value){
            case "Working Week":
                this.setState({ timeRange: "0600-0900", dayRange: "mon-fri", includeHolidays: false });
                break;

            default:
                this.setState({ timeRange: "", dayRange: "", includeHolidays: false })
        }
    }

    render(){
        const handleChange = () => {
            this.setState({includeHolidays: !this.state.includeHolidays})
        };

        const options = ["Working Week", "Custom"];
        return (
          <div id={"contentContainer"} className={"contentContainer"}>
              <Dropdown
                  options={options}
                  placeholder={"Presets"}
                  onChange={this.updatePreset}
                  className={"presets"}
                  id={"presets"}
              />
              <TextField
                  label="time"
                  id="time"
                  className={"time"}
                  onChange={(e) => {
                      this.setState({timeRange: e.target.value})
                  }}
                  value={this.state.timeRange}
                  helperText={"e.g. 0600:0900"}
              />
              <TextField
                  label="dates"
                  id="date"
                  className={"date"}
                  onChange={(e) => {
                      this.setState({dateRange: e.target.value})
                  }}
                  value={this.state.dateRange}
                  helperText={"e.g. 2020-01-01:2020-0201"}
              />
              <TextField
                  label="days"
                  id="days"
                  className={"days"}
                  onChange={(e) => {
                      this.setState({dayRange: e.target.value})
                  }}
                  helperText={"e.g. mon:fri"}
                  value={this.state.dayRange}
              />
              <Checkbox
                  checked={this.state.includeHolidays}
                  onClick={handleChange}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                  id={"holiday"}
                  className={"holiday"}
              />
              <p id={"label"} className={"label"}>Include Holidays</p>
              <button
                  id={"go"}
                  className={"go"}
              >GO</button>
          </div>
        );

    }

}

export default SidebarContent;