from traveltimetools.utils import timeFormats
from random import choices
from numpy import quantile
import polars

# Q: Is this the ideal way to do this? 
# A: It is the way we currently do it.
def mean_daily_mean(observations):
    """Takes a list of DynamicBins and returns
    the *average* of the *daily averages*"""

    return polars.DataFrame({
        'date': [bin.singleDate for bin in observations],
        'travelTime': [bin.travelTime for bin in observations]
    }).group_by('date').agg(
        polars.col('travelTime').mean().alias('travelTime')
    ).select(
        polars.col('travelTime').mean()
    ).item()

def firstQuartile(observations):
    return quantile([obs.travelTime for obs in observations], 0.25)

def median(observations):
    return quantile([obs.travelTime for obs in observations], 0.5)

def thirdQuartile(observations):
    return quantile([obs.travelTime for obs in observations], 0.75)

functions = {
    'mean': mean_daily_mean,
    'firstQuartile': firstQuartile,
    'median': median,
    'thirdQuartile': thirdQuartile
}

def estimateParameters(sample):
    """returns bootstrapped confidence intervals for the sample"""
    if len(sample) == 0:
        return None
    data = {}

    for funcName, func in functions.items():
        data[funcName] = {
            'estimate': timeFormats(func(sample), 1),
            'bootstrapDistribution': []
        }

    for i in range(0, 300): # number of bootstrap resamples
        # resample with replacement
        bootstrapSample = choices( sample, k = len(sample) )
        # estimate functions from resampled distribution
        for funcName, func in functions.items():
            data[funcName]['bootstrapDistribution'].append(func(bootstrapSample))

    for estimate in data.values():
        lowerCI, upperCI = quantile(
            estimate['bootstrapDistribution'],
            [0.025, 0.975] # 95% confidence interval
        )
        estimate['confidenceInterval'] = {
            'lower': timeFormats(lowerCI, 1),
            'upper': timeFormats(upperCI, 1)
        }
        del estimate['bootstrapDistribution']

    return data
