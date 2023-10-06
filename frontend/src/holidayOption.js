import { Factor } from './factor.js'
//import { useContext, useState, useEffect } from 'react'
import { DataContext } from './Layout'

export class HolidayOption extends Factor {
    #includeHolidays
    constructor(dataContext,includeHolidays){
        super(dataContext)
        this.#includeHolidays = includeHolidays
    }
    get holidaysIncluded(){ return this.#includeHolidays }
    get name(){ return `holidays included = ${this.holidaysIncluded}` }
}