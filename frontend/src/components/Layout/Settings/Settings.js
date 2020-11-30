import {MAX_DATE, MIN_DATE} from "../Datetime/Range";

class Settings{
    constructor() {
        this.startDate = null;
        this.endDate = null;
        this.includeHolidays = null;
        this.daysOfWeek = null;
        this.fileType = null;
        this.fields = null;
    }

    getStartDate(){
        return this.startDate;
    }

    setStartDate(startDate){
        this.startDate = startDate;
    }

    getEndDate(){
        return this.endDate;
    }

    setEndDate(endDate){
        this.endDate = endDate;
    }

    getIncludeHolidays(){
        return this.includeHolidays;
    }

    setIncludeHolidays(includeHolidays){
        this.includeHolidays = includeHolidays;
    }

    getDaysOfWeek(){
        return this.daysOfWeek;
    }

    setDaysOfWeek(daysOfWeek){
        this.daysOfWeek = daysOfWeek;
    }

    getFileType(){
        return this.fileType;
    }

    setFileType(fileType){
        this.fileType = fileType;
    }

    getFields(){
        return this.fields;
    }

    setFields(fields){
        this.fields = fields;
    }

}

class SettingsBuilder{
    constructor() {
        this.settings = new Settings();
    }

    setStartDate(startDate){
        this.settings.setStartDate(startDate);
        return this;
    }

    setEndDate(endDate){
        this.settings.setEndDate(endDate);
        return this;
    }

    setIncludeHolidays(includeHolidays){
        this.settings.setIncludeHolidays(includeHolidays);
        return this;
    }

    setDaysOfWeek(daysOfWeek){
        this.settings.setDaysOfWeek(daysOfWeek);
        return this;
    }

    setFileType(fileType){
        this.settings.setFileType(fileType);
        return this;
    }

    setFields(fields){
        this.settings.setFields(fields);
        return this;
    }

    getSettings(){
        return this.settings;
    }
}

class FileSettingsFactory{
    static getDefaultFields(){
        let fields = [];
        for(let i = 0; i < 29; i++){
            fields.push(false);
        }
        return fields;
    }

    static newFileSettings(params){
        let startDate = params.startDate !== undefined ? params.startDate : MIN_DATE;
        let endDate = params.endDate !== undefined ? params.endDate : MAX_DATE;
        let daysOfWeek = params.daysOfWeek !== undefined ? params.daysOfWeek : [true, true, true, true, true, true, true];
        let includeHolidays = params.includeHolidays !== undefined ? params.includeHolidays : false;
        let fileType = params.fileType !== undefined ? params.fileType : "csv";
        let fields = params.fields !== undefined ? params.fields : FileSettingsFactory.getDefaultFields();

        return new SettingsBuilder().setStartDate(startDate).setEndDate(endDate).setDaysOfWeek(daysOfWeek)
            .setIncludeHolidays(includeHolidays).setFileType(fileType).setFields(fields).getSettings();
    }
}