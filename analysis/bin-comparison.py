# test whether travel times are drawn from the same distribution

import requests, scipy

sig_level = 0.05

backend = {
    'production': 'http://localhost:8070',
    'development': 'http://localhost:8072'
}

dates = { # need to be incremented as more data available
    'pre': '2024-07-04/2024-07-07',
    'post': '2024-07-11/2024-07-14'
}

corridor = '30364284/30363982' # Eglinton Westbound from Bathurst to Allen

time = '16/18' # PM Peak

# get data for the same corridor and month, for each year in the range
def getObs(responseData):
    return [ tt['seconds'] for tt in responseData['results']['observations'] ]

for server, endpoint in backend.items():
    print(f'using {server} server:')
    data = [
        getObs( requests.get(
            f"{endpoint}/aggregate-travel-times/{corridor}/{time}/{dateRanges}/false/12345"
        ).json() )
    for dateRanges in dates.values() ]
    print('number of observations', [len(obs) for obs in data])

    # use a Mann-Whitney U test
    # https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
    # available in scipy as
    # https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ranksums.html

    data_t1 = data[0]
    data_t2 = data[1]
    stat, pvalue = scipy.stats.ranksums(data_t1, data_t2, 'two-sided')
    print(
        f'Travel time distributions differ with a P-value of {pvalue}'
        if pvalue < sig_level else
        f'Travel times are not significantly different' 
    )