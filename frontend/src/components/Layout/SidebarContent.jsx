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
                this.setState({ timeRange: "0600:0900", dayRange: "mon:fri", includeHolidays: false });
                break;

            default:
                this.setState({ timeRange: "", dayRange: "", includeHolidays: false })
        }
    }

    handleQuery = () =>{
        let params = this.parseData()
    }

    parseData(){

        let params = {};
        let times = this.state.timeRange.split(":");
        let days = this.state.dayRange.split(":");
        const validDays = ["sun", "mon", "tues", "wed", "thurs", "fri", "sat"];
        let dates = this.state.dateRange.split(":");

        // First validate the times
        if(!(times.length === 2 && times[0].length === 4 && times[1].length === 4 &&
            parseInt(times[0]) < 2400 && parseInt(times[1]) < 2400)){
            alert("Please enter a time range following the format: hhmm:hhmm")

            // next validate the days
        } else if(!(days.length === 2 && validDays.includes(days[0].toLowerCase()) &&
            validDays.includes(days[1].toLowerCase()))){
            alert("Please enter a day range following the format: start:end")

            // finally validate the dates
        } else if(!(dates.length === 2 && this.validDate(dates[0]) && this.validDate(dates[1]))){
            alert("Please enter a date range following the format: yyyy-mm-dd:yyyy-mm-dd");

            // everything is valid so parse the data
        } else {
            params = {
                startTimeStamp: dates[0] + " " + times[0],
                endTimeStamp:dates[1] + " " + times[1],
                startDay: days[0],
                endDay: days[1]
            }
        }
        return params;
    }

    validDate(dateString){
        let segments = dateString.split("-");
        if(segments.length === 3 && this.strIsInt(segments[0]) && segments[0].length === 4 &&
            this.strIsInt(segments[1]) && segments[1].length === 2 &&
            this.strIsInt(segments[2]) && segments[2].length === 2){
            return true;
        } else {
            console.log(segments.length);
            return false;
        }
    }

    // From stack overflow
    strIsInt(str){
        str = str.replace(/^0+/, "") || "0";
        let n = Math.floor(Number(str));
        return n !== Infinity && String(n) === str && n >= 0;
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
                  onClick={this.handleQuery}
              >GO</button>
          </div>
        );

    }

}

export default SidebarContent;