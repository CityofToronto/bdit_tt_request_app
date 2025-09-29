import numpy

# Q: Is this the ideal way to do this? 
# A: It is the way we currently do it.
def mean_daily_mean(obs):
    """Takes a list of tuples like [(date, numeric),...] and returns
    the average of the daily averages"""

    # group the observations by date
    dates = {}
    for (dt,tt) in obs:
        dates[dt] = [tt] if not dt in dates else dates[dt] + [tt]

    # take the daily averages
    daily_means = [ numpy.mean(times) for times in dates.values() ]

    # average the days together
    return numpy.mean(daily_means)
