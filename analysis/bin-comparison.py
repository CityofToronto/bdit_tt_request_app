# test whether travel times are drawn from the same distribution

import requests, scipy

sig_level = 0.05

backend = {
    'prod': 'http://localhost:8070',
    'dev': 'http://localhost:8072'
}

# https://trans-bdit.intra.prod-toronto.ca/tt-request-backend/aggregate-travel-times/30364284/30363982/12/14/2024-07-02/2024-07-06/true/1234567

corridor = '30364284/30363982' # Eglinton Westbound from Bathurst to Allen
time = '7/9' # AM Peak

# define a range of years to query data for
days = [ d for d in range(1, 6) ]

# get data for the same corridor and month, for each year in the range
def getObs(responseData):
    return [ tt['seconds'] for tt in responseData['results']['observations'] ]

data = [
    getObs(
        requests.get(f"{backend['prod']}/aggregate-travel-times/{corridor}/{time}/2024-07-{day:02d}/2024-07-{(day+1):02d}/true/12345").json()
    ) for day in days
]

# now test whether any of these sets of observations differ significantly
# from the others
# https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.kruskal.html
(stat, pvalue) = scipy.stats.kruskal(*data)

print(
    f'One or more of the distributions is different with a P-value of {pvalue}'
    if pvalue < sig_level else
    f'We fail to reject the null hypothesis that observations are drawn from the same distribution' 
)

if pvalue > sig_level:
    # if this test doesn't reject the null hypothesis
    # there's no need to go further
    raise SystemExit

# now let's find out which years saw significant differences from their
# preceding year. We'll use a Mann-Whitney U test
# https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
# available in scipy as
# https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ranksums.html

for t1_day, data_t1, data_t2 in zip(days, data, data[1:]):
    stat, pvalue = scipy.stats.ranksums(data_t1, data_t2, 'two-sided')
    print(
        f'Travel time distributions differ between {t1_day} and {t1_day+1} with a P-value of {pvalue}'
        if pvalue < sig_level else
        f'Travel times between {t1_day} and {t1_day+1} are not significantly different' 
    )