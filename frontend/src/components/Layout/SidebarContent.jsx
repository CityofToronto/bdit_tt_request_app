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
              />
              <TextField
                  label="date"
                  defaultValue={"2020/01/01-2020/03/01"}
                  id="date"
                  className={"date"}
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