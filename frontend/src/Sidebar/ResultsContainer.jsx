import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../Layout'
import BigButton from './BigButton'

export default function ResultsContainer(){
    const [ results, setResults ] = useState(undefined)
    const [ isFetchingData, setIsFetchingData ] = useState(false)
    const [ doneCount, setDoneCount ] = useState(-1)
    const { data } = useContext(DataContext)
    const numResults = data.travelTimeQueries.length
    useEffect(()=>{
        data.queue.on('active',()=>{
            setDoneCount(count => count + 1)
        })
    },[])
    return (
        <div>
            {numResults} travel time{numResults == 1 ? '' : 's'} to be queried
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
            {isFetchingData && <>
                <p>Finished fetching {doneCount}/{numResults} results</p>
                <ProgressBar percentDone={100*doneCount/numResults}/>
            </>}
            {results && <>
                    <a download='results.json'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(results.map(r=>r.resultsRecord('json'))))}`}
                    >
                        <BigButton>Download results as JSON</BigButton>
                    </a>
                    <a download='results.csv'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent([...results[0].resultsRecord('').keys()].join(',') + '\n' + results.map(r=>r.resultsRecord('csv')).join('\n'))}`}
                    >
                        <BigButton>Download results as CSV </BigButton>
                    </a>
                </>
            }
        </div>
    )
}

function ProgressBar({percentDone}){
    return (
        <svg viewBox='0 0 100 7'>
            <rect height='100%' width='100%' fill='white' stroke='black' strokeWidth='1'/>
            <rect height='100%' width={percentDone} fill='darkgreen' strokeWidth='1'/>
        </svg>
    )
}