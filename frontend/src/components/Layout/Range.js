export const MAX_DATE = new Date("2018-09-30 19:55:00");
export const MIN_DATE = new Date("2018-09-01 00:00:00");

class DatetimeRange{

    constructor() {
        this.startDate = null;
        this.endDate = null;
        this.startTime = null;
        this.endTime = null;
        this.daysOfWeek = null;
        this.includeHolidays = null;
        this.preset = null;
        this.name = null;
    }

    setStartDate(startDate){
        this.startDate = startDate;
    }

    getStartDate(){
        return this.startDate;
    }

    setEndDate(endDate){
        this.endDate = endDate;
    }

    getEndDate(){
        return this.endDate;
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

    setDaysOfWeek(daysOfWeek){
        this.daysOfWeek = daysOfWeek;
    }

    getDaysOfWeek(){
        return this.daysOfWeek;
    }

    setIncludeHolidays(newHolidays){
        this.includeHolidays = newHolidays;
    }

    getIncludeHolidays(){
        return this.includeHolidays;
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
        params.startDate = this.getStartDate();
        params.endDate = this.getEndDate();
        params.startTime = this.getStartTime();
        params.endTime = this.getEndTime();
        params.daysOfWeek = this.getDaysOfWeek();
        params.includeHolidays = this.getIncludeHolidays();
        params.preset = this.getPreset();
        params.name = this.getName();
        return params;
    }

}

class RangeBuilder{
    constructor() {
        this.range = new DatetimeRange();
    }

    setStartTime(startTime){
        this.range.setStartTime(startTime);
        return this;
    }

    setEndTime(endTime){
        this.range.setEndTime(endTime);
        return this;
    }

    setStartDate(startDate){
        this.range.setStartDate(startDate);
        return this;
    }

    setEndDate(endDate){
        this.range.setEndDate(endDate);
        return this;
    }

    setDaysOfWeek(daysOfWeek){
        this.range.setDaysOfWeek(daysOfWeek);
        return this;
    }

    setIncludeHolidays(includeHolidays){
        this.range.setIncludeHolidays(includeHolidays);
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
        let startDate = params.startDate !== undefined ? params.startDate : MIN_DATE;
        let endDate = params.endDate !== undefined ? params.endDate : MAX_DATE;
        let startTime = params.startTime !== undefined ? params.startTime : MIN_DATE;
        let endTime = params.endTime !== undefined ? params.endTime : MAX_DATE;
        let daysOfWeek = params.daysOfWeek !== undefined ? params.daysOfWeek : [true, true, true, true, true, true, true];
        let includeHolidays = params.includeHolidays !== undefined ? params.includeHolidays : false;
        let preset = params.preset !== undefined ? params.preset : "Custom";
        let name = params.name !== undefined ? params.name : "new range";

        return new RangeBuilder().setStartDate(startDate).setEndDate(endDate).setStartTime(startTime)
            .setEndTime(endTime).setDaysOfWeek(daysOfWeek).setIncludeHolidays(includeHolidays).setPreset(preset)
            .setName(name).getRange();
    }
}

export default RangeFactory;