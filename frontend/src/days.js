import { Factor } from './factor.js'

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
    #days = new Set(daymap.values())
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
        if(daymap.keys().includes(number)){
            this.#days.add(number)
        }
    }
    removeDay(number){
        this.#days.delete(number)
    }
    get name(){
        if(this.#days.size == 7){
            return 'all days of the week'
        } else if(this.#days.size > 0){
            return this.daysmap.entries().filter(([num,name])=>{
                return this.#days.has(num)
            }).map(([num,name])=>name).join(', ')
        }
        return 'no days selected'
    }
}