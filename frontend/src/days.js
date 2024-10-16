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

const weekday = new Set([1,2,3,4,5])
const weekend = new Set([6,7])

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
    get ISODOWs(){
        // returns a copy just to be safe
        return new Set(this.#days)
    }
    addDay(number){
        if( daylist.map(d=>d.iso).includes(parseInt(number)) ){
            this.#days.add(parseInt(number))
            this.hasUpdated()
        }
    }
    removeDay(number){
        let dayNum = parseInt(number)
        if(this.#days.has(dayNum)){
            this.#days.delete(dayNum)
            this.hasUpdated()
        }
    }
    hasDay(number){
        return this.#days.has(parseInt(number))
    }
    setFromSet(dowSet){
        const validDays = new Set([...weekday,...weekend])
        let validDowSet = new Set([...dowSet].filter(v => validDays.has(v)))
        this.#days = validDowSet
    }
    get name(){
        if(this.#days.size == 7){
            return 'all days'
        } else if(
            this.#days.size == weekday.size
            && [...weekday].every(v => this.#days.has(v))
        ){
            return 'weekdays'
        } else if(
            this.#days.size == weekend.size
            && [...weekend].every(v => this.#days.has(v))
        ){
            return 'weekends'
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