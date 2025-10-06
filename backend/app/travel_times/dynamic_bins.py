import polars
from app.travel_times.FiveMinBin import FiveMinBin
from app.travel_times.DynamicBin import DynamicBin

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
