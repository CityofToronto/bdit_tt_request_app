import { useState, useContext } from 'react'
import { Factor } from './factor.js'
import { DataContext } from './Layout'

const daymap = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
}

export class Days extends Factor {
    // initialize with all days included
    #days = new Set(Object.keys(daymap).map(n => parseInt(n)))
    constructor(dataContext){
        super(dataContext)
    }
    get apiString(){
        return [...this.#days].join('')
    }
    get isComplete(){
        return this.#days.size > 0
    }
    addDay(number){
        console.log('add',number)
        if(Object.keys(daymap).includes(String(number))){
            this.#days.add(parseInt(number))
            console.log('it worked')
        }
    }
    removeDay(number){
        this.#days.delete(parseInt(number))
    }
    hasDay(number){
        return this.#days.has(parseInt(number))
    }
    get name(){
        if(this.#days.size == 7){
            return 'all days of the week'
        } else if(this.#days.size > 0){
            return Object.entries(daymap).filter(([num,name])=>{
                return this.#days.has(parseInt(num))
            }).map(([num,name])=>name).join(', ')
        }
        return 'no days selected'
    }
    render(){ return <DaysElement days={this}/> }
}

function DaysElement({days}){
    const { logActivity } = useContext(DataContext)
    if(days.isActive){
        return Object.entries(daymap).map( ([num,name]) => (
            <div key={num}>
                <input name={name}
                    type='checkbox'
                    onChange={ event => {
                        if(event.target.checked){
                            days.addDay(num)
                            logActivity(`add ${name}`)
                        }else{
                            days.removeDay(num)
                            logActivity(`remove ${name}`)
                        }
                    } }
                    checked={days.hasDay(num)}/>
                <label htmlFor={name}>{name}</label>
            </div>
        ) )
    }
    return days.name 
}