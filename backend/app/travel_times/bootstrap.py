from app.travel_times.measures import mean_daily_mean, median
from traveltimetools.utils import timeFormats
from random import choices
from numpy import percentile

# this is a quite low, but quick
resamples = 100

# 95% confidence interval
pctLower = 2.5
pctUpper = 97.5

def bootstrap(sample):
    """returns bootstrapped confidence intervals for the sample"""

    if len(sample) == 0:
        return None
    sample_mean_distribution = []
    sample_median_distribution = []
    for i in range(0, resamples):
        bootstrap_sample = choices( sample, k = len(sample) )
        sample_mean_distribution.append( mean_daily_mean(bootstrap_sample) )
        sample_median_distribution.append( median(bootstrap_sample) )

    meanLowerCI, meanUpperCI = percentile(
        sample_mean_distribution,
        [pctLower, pctUpper]
    )
    medianLowerCI, medianUpperCI = percentile(
        sample_median_distribution,
        [pctLower, pctUpper]
    )
    return {
        'p=0.95': {
            'mean': {
                'lower': timeFormats(meanLowerCI, 1),
                'upper': timeFormats(meanUpperCI, 1)
            },
            'median': {
                'lower': timeFormats(medianLowerCI, 1),
                'upper': timeFormats(medianUpperCI, 1)
            }
        }
    }
