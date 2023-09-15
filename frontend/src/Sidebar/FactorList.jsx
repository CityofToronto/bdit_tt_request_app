import { useContext } from 'react'
import { DataContext } from '../Layout'

// requires the factor classes to implement the following methods
// .isActive
// .render()
// .isComplete
// .delete()

export default function FactorList({factors}){
    const { logActivity } = useContext(DataContext) 
    return (
        <div className='factor-list'>
            {factors.map( (factor,i) => {
                let classes = ['factor']
                if(factor.isActive){ classes = [...classes,'active'] }
                if(factor.isComplete){ classes = [...classes,'complete'] }
                return (
                    <div className={classes.join(' ')} key={i} onClick={()=>{
                        if(!factor.isActive){
                            factor.activate()
                            logActivity('focus factor')
                        }
                    } }>
                        <div className='deleteButton' onClick={()=>{
                            factor.delete()
                            logActivity(`delete factor`)
                        }}>
                            &#x2716;
                        </div>
                        {factor.render()}
                    </div>
                )
            } ) }
        </div>
    )
}