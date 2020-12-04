class TimeRange{

    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.preset = null;
        this.name = null;
    }

    setStartTime(startTime){
        this.startTime = startTime;
    }

    getStartTime(){
        return this.startTime;
    }

    setEndTime(endTime){
        this.endTime = endTime;
    }

    getEndTime(){
        return this.endTime
    }

    getPreset(){
        return this.preset;
    }

    setPreset(preset){
        this.preset = preset;
    }

    setName(name){
        this.name = name;
    }

    getName(){
        return this.name;
    }

    getParams(){
        let params = {};
        params.startTime = this.getStartTime();
        params.endTime = this.getEndTime();
        params.preset = this.getPreset();
        params.name = this.getName();
        return params;
    }

}

class RangeBuilder{
    constructor() {
        this.range = new TimeRange();
    }

    setStartTime(startTime){
        this.range.setStartTime(startTime);
        return this;
    }

    setEndTime(endTime){
        this.range.setEndTime(endTime);
        return this;
    }

    setPreset(preset){
        this.range.setPreset(preset);
        return this;
    }

    setName(name){
        this.range.setName(name);
        return this;
    }

    getRange(){
        return this.range;
    }
}

class RangeFactory{
    static newRange(params){
        let startTime = params.startTime ? params.startTime : new Date("2000-01-01 00:00:00");
        let endTime = params.endTime ? params.endTime : new Date();
        let preset = params.preset ? params.preset : "Custom";
        let name = params.name ? params.name : "new range";

        return new RangeBuilder().setStartTime(startTime).setEndTime(endTime).setPreset(preset).setName(name).getRange();
    }
}

export default RangeFactory;