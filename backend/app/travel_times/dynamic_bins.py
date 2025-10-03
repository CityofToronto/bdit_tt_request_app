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
    dynamicBins = list()

    bins5min = obs_df.sql("""
        SELECT
            dt,
            bin_num,
            ARRAY_AGG(DISTINCT link_dir)
        FROM self
        GROUP BY dt, bin_num
    """)

    dynamicBin = DynamicBin(links_df)

    for dt, binNum, linkdirs in bins5min.iter_rows():
        dynamicBin.extendTo(
            FiveMinBin(dt, binNum, linkdirs)
        )
        if dynamicBin.isComplete:
            # stash the current one and start a new dynamic bin
            dynamicBins.append(dynamicBin)
            dynamicBin = DynamicBin(links_df)
    return dynamicBins

class FiveMinBin:
    def _init__(self, dt, binNum, linkdirs):
        self.dt = dt
        self.binNum = binNum
        self.linkdirs = set(linkdirs)

class DynamicBin:
    def __init__(self, links):
        self.corridorLinks = links
        self.subBins = list()
    
    def extendTo(self, newBin):
        # remove any prior bins from a different date
        self.subBins = [ b for b in self.subBins if b.dt == newBin.dt ]
        # remove any prior bins from too long ago
        self.subBins = [ b for b in self.subBins if b.binNum >= newBin.binNum - maxBinsPerDynamicBin ]
        # finally, add the new bin
        self.subBins.append(newBin)

    @property
    def isComplete(self):
        pass
        # TODO: check length of the distinct links in subBins against threshold