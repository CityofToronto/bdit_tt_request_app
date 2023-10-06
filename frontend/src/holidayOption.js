import { Factor } from './factor.js'

export class HolidayOption extends Factor {
    #includeHolidays
    #dataContext
    constructor(dataContext,includeHolidays){
        super(dataContext)
        // store this here too to actually access the holiday data
        this.#dataContext = dataContext
        // selection for whether to include holidays
        this.#includeHolidays = includeHolidays
    }
    get holidaysIncluded(){ return this.#includeHolidays }
    get holidays(){
        return this.#dataContext.holidays
    }
}