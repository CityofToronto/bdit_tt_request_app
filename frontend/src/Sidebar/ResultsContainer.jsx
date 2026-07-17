import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../Layout'
import BigButton from './BigButton'

export default function ResultsContainer(){
    const [ isFetchingData, setIsFetchingData ] = useState(false)
    const [ progress, setProgress ] = useState(-1)
    const { data } = useContext(DataContext)
    useEffect(()=>{
        data.queue.on('active',()=>{
            setProgress( 100 * data.queryCountFinished / data.queryCount )
        })
    },[])
    return (
        <div>
            {!isFetchingData && <>
                {data.queryCount} travel time{data.queryCount == 1 ? '' : 's'} to be queried
            </>}
            {data.queryCount > 0 && !isFetchingData && !data.allQueriesHaveData &&
                <BigButton onClick={()=>{
                    setIsFetchingData(true)
                    data.fetchAllResults().then( () => {
                        setIsFetchingData(false)
                    } )
                }}>Submit Query</BigButton>
            }
            {isFetchingData && <>
                <p>Finished fetching {data.queryCountFinished}/{data.queryCount} results</p>
                <ProgressBar
                    totalCount={data.queryCount}
                    queue={data.queue}
                />
            </>}
            {data.allQueriesHaveData && <>
                    <a download='results.json'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(data.travelTimeQueries.map(r=>r.resultsRecord('json'))))}`}
                    >
                        <BigButton>Download results as JSON</BigButton>
                    </a>
                    <a download='results.csv'
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent([...data.travelTimeQueries[0].resultsRecord('').keys()].join(',') + '\n' + data.travelTimeQueries.map(r=>r.resultsRecord('csv')).join('\n'))}`}
                    >
                        <BigButton>Download results as CSV </BigButton>
                    </a>
                </>
            }
        </div>
    )
}

function ProgressBar({totalCount, queue}) {
    let percentRequested = 100 * (totalCount - queue.size) / totalCount
    let percentResolved = 100 * (totalCount - queue.size - queue.pending) / totalCount
    return (
        <svg viewBox='0 0 100 7'>
            <rect height='100%' width={percentRequested} fill='lightgreen'>
                <title>In progress</title>
            </rect>
            <rect height='100%' width={percentResolved} fill='darkgreen'>
                <title>Completed</title>
            </rect>
            <rect height='100%' width='100%' fill='none' stroke='black' strokeWidth='1'>
                <title>Pending</title>
            </rect>
        </svg>
    )
}
