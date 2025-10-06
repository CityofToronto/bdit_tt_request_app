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
