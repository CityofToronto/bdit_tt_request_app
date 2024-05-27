# test whether travel times are drawn from the same distribution

import requests

backend = 'http://localhost:8072/aggregate-travel-times'

# get data for the same corridor and month, one year apart
tt1 = requests.get(f'{backend}/30345882/30357505/16/19/2022-04-01/2022-05-01/false/12345').json()
tt2 = requests.get(f'{backend}/30345882/30357505/16/19/2023-04-01/2023-05-01/false/12345').json()
# major complete-street rebuild took place between tt2 and tt3
tt3 = requests.get(f'{backend}/30345882/30357505/16/19/2024-04-01/2024-05-01/false/12345').json()

tt1_obs = [ tt['seconds'] for tt in tt1['results']['observations'] ]
tt2_obs = [ tt['seconds'] for tt in tt2['results']['observations'] ]
tt3_obs = [ tt['seconds'] for tt in tt3['results']['observations'] ]

import scipy.stats as stats
# https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ranksums.html
# aka
# https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
statistic1, pvalue1 = stats.ranksums(tt1_obs, tt2_obs,'two-sided')
statistic2, pvalue2 = stats.ranksums(tt2_obs, tt3_obs,'two-sided')

sig_level = 0.05

print(f'P = {pvalue1}', 'not different' if pvalue1 > sig_level else 'different')
print(f'P = {pvalue2}', 'not different' if pvalue2 > sig_level else 'different')