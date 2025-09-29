from app.travel_times.daily_aggregation import mean_daily_mean
from traveltimetools.utils import timeFormats
import random
import numpy

# this is a bit low, but efficient
resamples = 100

# 95% confidence interval
pctLower = 2.5
pctUpper = 97.5

def bootstrap(sample):
    """returns bootstrapped confidence intervals for the sample"""

    if len(sample) == 0:
        return None
    sample_distribution = []
    for i in range(0, resamples):
        bootstrap_sample = random.choices( sample, k = len(sample) )
        sample_distribution.append( mean_daily_mean(bootstrap_sample) )
    lowerCI, upperCI = numpy.percentile(
        sample_distribution,
        [pctLower, pctUpper]
    )
    return {
        'p=0.95': {
            'lower': timeFormats(lowerCI,1),
            'upper': timeFormats(upperCI,1)
        }
    }
