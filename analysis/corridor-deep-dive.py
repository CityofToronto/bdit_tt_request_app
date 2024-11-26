# We know (or suspect) that something has changed in a corridor with 
# regard to travel times. But where exactly did the change happen?
# When? Can we isolate the change by further segmenting the analysis?
#
# I'll build this out around the case of the Bloor West Complete Street Phase 1
# but hope that it's applicable beyond that. 

import requests, scipy, numpy, pandas
from datetime import date

sig_level = 0.05
min_length_to_analyse = 250 # meters

backend = 'http://localhost:8072'

dates = {
    'before': '2024-09-01/2024-10-11',
    'after': '2024-10-16/2024-11-23'
}
time = '15/18' # PM Peak
corridor = '30345882/30357505' # Bloor eastbound from Aberfoyle to Runnymede

# fetch all the links for this corridor
links = requests.get(f"{backend}/link-nodes/{corridor}").json()['links']

# create a list of node OD pairs to iterate over
# basically a spatial moving window over the corridor
queries = []
cumWindowStartM = 0
for i, link in enumerate(links):
    cumWindowLength = link['length_m']
    for next_link in links[i+1:]:
        if cumWindowLength >= min_length_to_analyse:
            queries.append({
                'ODpair': f'{link["source"]}/{next_link["target"]}',
                # start and end positions of the rolling window
                'windowStartM': cumWindowStartM,
                'windowEndM': cumWindowStartM + cumWindowLength
            })
            break
        cumWindowLength += next_link['length_m']
    cumWindowStartM += link['length_m']


def getObs(responseData):
    return [ tt['seconds'] for tt in responseData['results']['observations'] ]

for query in queries:
    # get data for both date ranges
    data = [
        requests.get(
            f"{backend}/aggregate-travel-times/{query['ODpair']}/{time}/{dateRanges}/false/12345"
        ).json() for dateRanges in dates.values()
    ]
    before_response = data[0]
    after_response = data[1]
    before_data = getObs(before_response)
    after_data = getObs(after_response)
    # store the means
    query['tt_before'] = before_response['results']['travel_time']['seconds']
    query['tt_after'] = after_response['results']['travel_time']['seconds']
    # Apply a one-tailed Mann-Whitney U test
    stat, pvalue = scipy.stats.ranksums(
        before_data,
        after_data,
        'greater' # one-tailed test that before > after (times decreased)
    )
    query['p'] = pvalue

    print(
        query['ODpair'],
        '(travel times higher',
        'before)' if numpy.mean(before_data) > numpy.mean(after_data) else 'after)',
        pvalue
    )

results = pandas.DataFrame(queries)

print(results)

results.to_csv('corridor-windows.csv')
