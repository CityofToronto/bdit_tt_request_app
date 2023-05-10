export default class TimeRange{
    #startTime = null
    #endTime = null
    #preset = null
    #name = null
    constructor({startTime,endTime,preset,name}) {
        this.#startTime = startTime ?? new Date("2000-01-01 00:00:00")
        this.#endTime = endTime ?? new Date()
        this.#preset = preset ?? 'custom'
        this.#name = name ?? 'new range'
    }
    get startTime(){ return this.#startTime }
    setStartTime(startTime){ this.#startTime = startTime }
    get endTime(){ return this.#endTime }
    setEndTime(endTime){ this.#endTime = endTime }
    get preset(){ return this.#preset }
    setPreset(preset){ this.#preset = preset }
    get name(){ return this.#name }
    setName(name){ this.#name = name }
    get params(){
        return {
            startTime: this.#startTime,
            endTime: this.#endTime,
            preset: this.#preset,
            name: this.#name
        }
    }
}