import pandas

# arbitrary number we've been using for at least a few years
# specifies that at least 80% of corridor by length must have _some_ data
minimumCoverageThreshold = 0.8

# how long can a dynamic bin get?
maximumBinLengthMinutes = 30
nativeBinSizeMinutes = 5
maxBinsPerDynamicBin = maximumBinLengthMinutes / nativeBinSizeMinutes

def createDynamicBins(obs_df, links_df):
    """Create the smallest temporal bins possible while ensuring data coverage
    Defines bins by
        [starting bin number, ending bin number] ... i.e. both are inclusive
    returns a list of bins
    """

    minLength = links_df['length'].sum() * minimumCoverageThreshold

    # start with empty list of bins
    bins = list()

    print(obs_df[['dt','bin_num']].drop_duplicates().sort_values(['dt','bin_num']))


    return None