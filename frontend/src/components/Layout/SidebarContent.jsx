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

    render(){
        const handleChange = () => {
            this.setState({includeHolidays: !this.state.includeHolidays})
        };

        const options = ["one", "two", "three"];
        const defaultOption = "None"
        return (
          <div id={"contentContainer"} className={"contentContainer"}>
              <Dropdown
                  options={options}
                  value={defaultOption}
                  placeholder={"Presets"}
                  className={"presets"}
                  id={"presets"}
              />
              <TextField
                  label="time"
                  defaultValue={"0600-0900"}
                  id="time"
                  className={"time"}
                  onChange={(e) => {
                      this.setState({timeRange: e.target.value})
                  }}
              />
              <TextField
                  label="dates"
                  defaultValue={"2020/01/01-2020/03/01"}
                  id="date"
                  className={"date"}
                  onChange={(e) => {
                      this.setState({dateRange: e.target.value})
                  }}
              />
              <TextField
                  label="days"
                  defaultValue={"mon-fri"}
                  id="days"
                  className={"days"}
                  onChange={(e) => {
                      this.setState({dayRange: e.target.value})
                  }}
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