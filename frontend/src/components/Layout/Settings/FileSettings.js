import {MAX_DATE, MIN_DATE} from "../Datetime/Range";
import {formattedDateString} from "../Datetime/TimeRangeParser";

class FileSettings{
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

    getParams(){
        let params = {};
        params.startDate = this.getStartDate();
        params.endDate = this.getEndDate();
        params.daysOfWeek = this.getDaysOfWeek();
        params.includeHolidays = this.getIncludeHolidays();
        params.fileType = this.getFileType();
        params.fields = this.getFields();
        return params;
    }

    parseSettings(){
        if( !this.startDate || !this.endDate || !this.daysOfWeek || this.includeHolidays === null ||
            !this.fileType || !this.fields){
            return null;
        } else {
            return {
                'start_date': formattedDateString(this.startDate),
                'end_date': formattedDateString(this.endDate),
                'days_of_week': this.daysOfWeek,
                'include_holidays': this.includeHolidays,
                'file_type': this.fileType,
                'fields': this.fields,
            };
        }
    }

}

class FileSettingsBuilder{
    constructor() {
        this.settings = new FileSettings();
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
        for(let i = 0; i < 30; i++){
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

        return new FileSettingsBuilder().setStartDate(startDate).setEndDate(endDate).setDaysOfWeek(daysOfWeek)
            .setIncludeHolidays(includeHolidays).setFileType(fileType).setFields(fields).getSettings();
    }
}

export default FileSettingsFactory;