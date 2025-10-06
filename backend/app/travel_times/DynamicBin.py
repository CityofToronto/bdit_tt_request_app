import polars

# arbitrary number we've been using for at least a few years
# specifies that at least 80% of corridor by length must have _some_ data
minimumCoverageThreshold = 0.8

# how long can a dynamic bin get?
maximumBinLengthMinutes = 30
nativeBinSizeMinutes = 5
maxBinsPerDynamicBin = maximumBinLengthMinutes / nativeBinSizeMinutes

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
        # intending this to wrap dates eventually, thus allowing mutliples 
        return set( bin.date for bin in self.subBins)
    
    @property
    def date(self):
        # simple implementation for now
        return self.subBins[0].date

    @property
    def length(self):
        return len(self.subBins)