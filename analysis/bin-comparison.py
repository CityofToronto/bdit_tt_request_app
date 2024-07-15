# test whether travel times are drawn from the same distribution

import requests, scipy, numpy

sig_level = 0.05

backend = {
    'production': 'http://localhost:8070',
    'development': 'http://localhost:8072'
}

dates = { # need to be incremented as more data available
    'before': '2024-07-04/2024-07-07',
    'after': '2024-07-11/2024-07-14'
}

corridor = '30364284/30363982' # Eglinton Westbound from Bathurst to Allen

time = '15/18' # PM Peak

def getObs(responseData):
    return [ tt['seconds'] for tt in responseData['results']['observations'] ]

for server, endpoint in backend.items():
    print(f'using {server} server:')
    data = [
        getObs( requests.get(
            f"{endpoint}/aggregate-travel-times/{corridor}/{time}/{dateRanges}/false/12345"
        ).json() )
    for dateRanges in dates.values() ]
    print(
        'number of observations:',
        [len(obs) for obs in data],
        '(travel times higher',
        'before)' if numpy.mean(data[0]) > numpy.mean(data[1]) else 'after)'
    )

    # Apply a Mann-Whitney U test
    # https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
    # available in scipy as
    # https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ranksums.html

    before_data = data[0]
    after_data = data[1]
    stat, pvalue = scipy.stats.ranksums(
        before_data,
        after_data,
        'greater' # one-tailed test that before > after (times decreased)
    )
    print(
        f'Travel time distributions differ with a P-value of {pvalue}'
        if pvalue < sig_level else
        f'Travel times are not significantly different' 
    )

    # plot histograms side by side
    from matplotlib import pyplot
    bins = numpy.linspace(0, 600, 20)
    pyplot.hist(data[0], bins, alpha=0.5, label='before')
    pyplot.hist(data[1], bins, alpha=0.5, label='after')
    pyplot.legend()
    pyplot.title(server)
    pyplot.savefig(f'./histogram-{server}.png')
    pyplot.close()