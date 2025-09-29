from app.travel_times.daily_aggregation import mean_daily_mean
from traveltimetools.utils import timeFormats

import random
import numpy


def bootstrap(sample):
    reported_intervals = None
    if len(sample) > 1:
        # bootstrap for synthetic sample distribution
        sample_distribution = []
        for i in range(0,100):
            bootstrap_sample = random.choices( sample, k = len(sample) )
            sample_distribution.append( mean_daily_mean(bootstrap_sample) )
        p95lower, p95upper = numpy.percentile(sample_distribution, [2.5, 97.5])
        reported_intervals = {
            'p=0.95': {
                'lower': timeFormats(p95lower,1),
                'upper': timeFormats(p95upper,1)
            }
        }
    return reported_intervals
