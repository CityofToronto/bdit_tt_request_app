export class Factor {

    #dataContext // data manager
    #isActive // is focused by user

    constructor(dataContext){
        // make this one aware of all others
        this.#dataContext = dataContext
    }

    get isActive(){ return this.#isActive }
    activate(){
        this.#isActive = true
        this.#dataContext.deactivateOtherFactors(this)
    }
    deactivate(){ this.#isActive = false }

    get name(){
        // this should be overwritten but all classes _will_ have a name method
        return 'New undefined factor'
    }

    delete(){
        this.#dataContext.dropFactor(this)
    }

    render(){ // this will be overwritten but must be implemented
        return <></>
    }
    notifyIsUpdated(){
        // should be called when a factor has been updated and is complete
        this.#dataContext.updateQueries()
    }
}