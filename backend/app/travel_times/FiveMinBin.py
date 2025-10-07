from datetime import datetime

class FiveMinBin:
    def __init__(self, binNum, times_df):
        self.binNum = binNum
        self.linkdirs = set(times_df['link_dir'])
        self.times = times_df
    @property
    def date(self):
        return self.startTime.strftime('%Y-%m-%d')
    @property
    def linksdirs(self):
        return self.linkdirs
    @property
    def linkTravelTimes(self):
        return self.times
    @property
    def startTime(self):
        return datetime.fromtimestamp(self.binNum * 300)
    @property
    def endTime(self):
        """Exclusive end, so stop a millisecond shy of the actual time"""
        return datetime.fromtimestamp(self.binNum * 300 + 299.999)
