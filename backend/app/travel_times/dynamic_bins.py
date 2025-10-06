import polars

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

    # start with empty list of bins
    dynamicBins = list()

    bins5min = obs_df.sql("""
        SELECT DISTINCT
            dt,
            bin_num
        FROM self
        ORDER BY bin_num
    """)

    dynamicBin = DynamicBin(links_df)

    for dt, binNum in bins5min.iter_rows():
        binData = obs_df.filter(polars.col('bin_num') == binNum).select(['link_dir','travelTime'])
        dynamicBin.extendTo(
            FiveMinBin(dt, binNum, binData)
        )
        if dynamicBin.isComplete:
            # stash the current one and start a new dynamic bin
            dynamicBins.append(dynamicBin)
            dynamicBin = DynamicBin(links_df)
    return dynamicBins

class FiveMinBin:
    def __init__(self, dt, binNum, times_df):
        self.dt = dt
        self.binNum = binNum
        self.linkdirs = set(times_df['link_dir'])
        self.times = times_df
    @property
    def date(self):
        return self.dt
    @property
    def linksdirs(self):
        return self.linkdirs
    @property
    def linkTravelTimes(self):
        return self.times

class DynamicBin:
    def __init__(self, links):
        self.corridorLinks = links
        self.subBins = list()
        self.totalLength = links['length'].sum()

    @property
    def minLength(self):
        return self.totalLength * minimumCoverageThreshold

    def extendTo(self, newBin):
        # remove any prior bins from a different date
        self.subBins = [
            b for b in self.subBins
            if b.date == newBin.date
        ]
        # remove any prior bins from too long ago
        self.subBins = [ 
            b for b in self.subBins
            if b.binNum >= newBin.binNum - maxBinsPerDynamicBin
        ]
        # finally, add the new bin
        self.subBins.append(newBin)

    @property
    def isComplete(self):
        # check length of the distinct links in sub-bins against threshold
        uniqueLinkdirs = set(
            linkdir
            for bin in self.subBins
            for linkdir in bin.linkdirs
        )
        links = self.corridorLinks.filter(
            polars.col('link_dir').is_in(uniqueLinkdirs)
        )
        lengthSoFar = links['length'].sum()
        return lengthSoFar >= self.minLength

    @property
    def travelTime(self):
        extrapolatedTravelTime = polars.concat(
            [bin.linkTravelTimes for bin in self.subBins]
        ).join(
            self.corridorLinks,
            on='link_dir'
        ).group_by(
            ['link_dir','length']
        ).agg(
            polars.col('travelTime').mean().alias('link_avg_tt')
        ).select(
            polars.col('link_avg_tt').sum().alias('totalObservedTravelTime'),
            polars.col('length').sum().alias('totalObservedLength')
        ).select(
            ( # extrapolate over missing data within each hour
                polars.col('totalObservedTravelTime') * self.totalLength / polars.col('totalObservedLength')
            ).alias('extrapolatedTravelTime')
        ).item()

        return extrapolatedTravelTime

    @property
    def dates(self):
        return set( bin.date for bin in self.subBins)

    @property
    def length(self):
        return len(self.subBins)
