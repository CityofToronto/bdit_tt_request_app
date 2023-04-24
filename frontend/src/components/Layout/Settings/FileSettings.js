import { formattedDateString } from "../Datetime/TimeRangeParser";

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

    getParams(){
        let params = {};
        params.startDate = this.getStartDate();
        params.endDate = this.getEndDate();
        params.daysOfWeek = this.getDaysOfWeek();
        params.includeHolidays = this.getIncludeHolidays();
        params.fileType = this.getFileType();
        return params;
    }

    parseSettings(){
        if( !this.startDate || !this.endDate || !this.daysOfWeek || this.includeHolidays === null ||
            !this.fileType ){
            return null;
        } else {
            return {
                'start_date': formattedDateString(this.startDate),
                'end_date': formattedDateString(this.endDate),
                'days_of_week': this.daysOfWeek,
                'include_holidays': this.includeHolidays,
                'file_type': this.fileType
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
    getSettings(){
        return this.settings;
    }
}

export default class FileSettingsFactory{
    static newFileSettings(params){
        return new FileSettingsBuilder()
            .setStartDate( params.startDate ?? new Date("2000-01-01") )
            .setEndDate( params.endDate ?? new Date() )
            .setDaysOfWeek( params.daysOfWeek ?? [true, true, true, true, true, true, true] )
            .setIncludeHolidays( params.includeHolidays ?? false )
            .setFileType( params.fileType ?? "geojson" )
            .getSettings()
    }
}