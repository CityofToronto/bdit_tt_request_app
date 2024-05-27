# test whether travel times are drawn from the same distribution

import requests, scipy

sig_level = 0.05

backend = 'http://localhost:8072'

# define a range of years to query data for
years = [ y for y in range(2018, 2025) ]

# get data for the same corridor and month, for each year in the range
def getObs(responseData):
    return [ tt['seconds'] for tt in responseData['results']['observations'] ]

data = [
    getObs(
        requests.get(f'{backend}/aggregate-travel-times/30345882/30357505/16/19/{year}-04-01/{year}-05-01/false/12345').json()
    ) for year in years
]

# now test whether any of these sets of observations differ significantly
# from the others
# https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.kruskal.html
(stat, pvalue) = scipy.stats.kruskal(*data)

print(
    f'One or more of the distributions is different with a P-value of {pvalue}'
    if pvalue < sig_level else
    f'We fail to reject the hypothesis that observations are drawn from the same distribution' 
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

for t1_year, data_t1, data_t2 in zip(years, data, data[1:]):
    stat, pvalue = scipy.stats.ranksums(data_t1, data_t2, 'two-sided')
    print(
        f'Travel time distributions differ between {t1_year} and {t1_year+1} with a P-value of {pvalue}'
        if pvalue < sig_level else
        f'Travel times between {t1_year} and {t1_year+1} are not significantly different' 
    )

# This is an interesting period. COVID happened, and then for this particular
# corridor, after things settled down for a year between 2022-2023, there was 
# a major road-diet / complete-street installed which greatly changed motor
# vehicle travel times