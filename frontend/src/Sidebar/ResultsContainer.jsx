import { useContext, useState } from 'react'
import { DataContext } from '../Layout'
import BigButton from './BigButton'


export default function ResultsContainer(){
    const [ results, setResults ] = useState(undefined)
    const [ isFetchingData, setIsFetchingData ] = useState(false)
    const { data } = useContext(DataContext)
    const numResults = data.travelTimeQueries.length
    return (
        <div>
            {numResults} travel time{numResults == 1 ? '' : 's'} to estimate currently
            {numResults > 0 && ! isFetchingData &&
                <BigButton onClick={()=>{
                    setResults(undefined)
                    setIsFetchingData(true)
                    data.fetchAllResults().then( () => {
                        setIsFetchingData(false)
                        setResults(data.travelTimeQueries)
                    } )
                }}>
                    Submit Query
                </BigButton>
            }
            {isFetchingData &&
                <p>Please wait while your request is being processed</p>
            }
            {results && <>
                    <a download='results.json'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(results.map(r=>r.resultsRecord('json'))))}`}
                    >
                        <BigButton>
                            Download results as JSON
                        </BigButton>
                    </a>
                    <a download='results.csv'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent([...results[0].resultsRecord('').keys()].join(',') + '\n' + results.map(r=>r.resultsRecord('csv')).join('\n'))}`}
                    >
                        <BigButton>
                            Download results as CSV 
                        </BigButton>
                    </a>
                </>
            }
        </div>
    )
}