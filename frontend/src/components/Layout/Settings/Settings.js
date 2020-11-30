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