import { Factor } from './factor.js'
import { domain } from './domain.js'
//import { useContext, useState, useEffect } from 'react'
import { DataContext } from './Layout'

export class HolidayOption extends Factor {
    #includeHolidays = true
    #holidays = []
    constructor(dataContext){
        super(dataContext)
        fetch(`${domain}/holidays`)
            .then( holidays => this.#holidays = holidays )
    }
    render(){
        return <p>hello world</p>
    }
}