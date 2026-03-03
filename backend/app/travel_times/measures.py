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

def median(observations):
    return quantile(
        [obs.travelTime for obs in observations],
        0.5
    )