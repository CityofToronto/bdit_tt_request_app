import { useContext } from 'react'
import { Factor } from './factor.js'
import { DataContext } from './Layout'

const daylist = [
    { iso: 1, js: 1, label: 'Monday' },
    { iso: 2, js: 2, label: 'Tuesday' },
    { iso: 3, js: 3, label: 'Wednesday' },
    { iso: 4, js: 4, label: 'Thursday' },
    { iso: 5, js: 5, label: 'Friday' },
    { iso: 6, js: 6, label: 'Saturday' },
    { iso: 7, js: 0, label: 'Sunday' } // note the different numeric representation
]

export class Days extends Factor {
    // initialize with all days included
    #days = new Set(daylist.map(d=>d.iso))
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
        if( daylist.map(d=>d.iso).includes(parseInt(number)) ){
            this.#days.add(parseInt(number))
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
            return daylist
                .filter( ({iso}) => this.#days.has(iso) )
                .map( ({label}) => label ).join(', ')
        }
        return 'no days selected'
    }
    render(){ return <DaysElement days={this}/> }
}

function DaysElement({days}){
    const { logActivity } = useContext(DataContext)
    if(days.isActive){
        return daylist.map( ({ iso: num, label: name }) => (
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