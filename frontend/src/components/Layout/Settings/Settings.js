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