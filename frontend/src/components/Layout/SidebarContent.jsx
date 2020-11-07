import React from "react";
import Dropdown from "react-dropdown";
import { TextField } from "@material-ui/core";
import { Checkbox } from "@material-ui/core";
import "react-dropdown/style.css";
import "./SidebarContent.css";

class SidebarContent extends React.Component{

    render(){

        return (
          <div id={"contentContainer"} className={"contentContainer"}>
              <Dropdown
                  options={this.props.presets}
                  placeholder={"Presets"}
                  onChange={this.props.onPresetChange}
                  className={"presets"}
                  id={"presets"}
              />
              <TextField
                  label="time"
                  id="time"
                  className={"time"}
                  onChange={this.props.onTimesUpdate}
                  value={this.props.timeRange}
                  helperText={"e.g. 0600:0900"}
              />
              <TextField
                  label="dates"
                  id="date"
                  className={"date"}
                  onChange={this.props.onDatesUpdate}
                  value={this.props.dateRange}
                  helperText={"e.g. 2020-01-01:2020-0201"}
              />
              <TextField
                  label="days"
                  id="days"
                  className={"days"}
                  onChange={this.props.onDaysUpdate}
                  helperText={"e.g. mon:fri"}
                  value={this.props.dayRange}
              />
              <Checkbox
                  checked={this.props.includeHolidays}
                  onClick={this.props.onHolidayUpdate}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                  id={"holiday"}
                  className={"holiday"}
              />
              <p id={"label"} className={"label"}>Include Holidays</p>
              <button
                  id={"go"}
                  className={"go"}
                  onClick={this.props.onGo}
              >GO</button>
          </div>
        );

    }

}

export default SidebarContent;