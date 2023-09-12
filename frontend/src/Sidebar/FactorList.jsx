// requires the three factor classes to implement the following methods
// .isActive
// .render()
// .

export default function FactorList({factors}){
    return (
        <div className='factor-list'>
            {factors.map( (factor,i) => {
                let classes = ['factor']
                if(factor.isActive){ classes = [...classes,'active'] }
                return (
                    <div className={classes.join(' ')} key={i}>
                        {factor.render()}
                    </div>
                )
            } ) }
        </div>
    )
}