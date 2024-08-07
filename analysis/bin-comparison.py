# test whether travel times are drawn from the same distribution

import requests, scipy, numpy

sig_level = 0.05

backend = {
    #'production': 'http://localhost:8070',
    'development': 'http://localhost:8072'
}

dates = {
    'before': '2024-07-01/2024-07-28',
    'after': '2024-07-30/2024-08-04'
}
corridors = [
    {'ids': '30414573/30412502', 'label': 'Richmond to Lakeshore'},
    {'ids': '30414649/30412502', 'label': 'Dundas to Lakeshore'},
    {'ids': '30414649/30414576', 'label': 'Dundas to Queen'},
    {'ids': '30414576/30414531', 'label': 'Queen to King'},
    {'ids': '30414531/30414540', 'label': 'King to Front'},
    {'ids': '30414540/30412502', 'label': 'Front to Lakeshore'},
]

times = [
    {'hours': '07/10', 'label': 'AM Peak'},
    {'hours': '10/15', 'label': 'Midday'},
    {'hours': '15/18', 'label': 'PM Peak'}
]

def getObs(responseData):
    return [ tt['seconds'] for tt in responseData['results']['observations'] ]

print('corridor,time_range,before_time_seconds,after_time_seconds,P_diff,difference_seconds')
for corridor in corridors:
    for time in times:
        for server, endpoint in backend.items():
            label = f"{corridor['label']} - {time['label']}"
            #print(label, server)
            data = [
                getObs( requests.get(
                    f"{endpoint}/aggregate-travel-times/{corridor['ids']}/{time['hours']}/{dateRanges}/false/12345"
                ).json() )
            for dateRanges in dates.values() ]
            #print(
            #    '\tnumber of observations:',
            #    [len(obs) for obs in data],
            #    '(travel times higher',
            #    'before)' if numpy.mean(data[0]) > numpy.mean(data[1]) else 'after)'
            #)

            # Apply a Mann-Whitney U test
            # https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
            # available in scipy as
            # https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ranksums.html

            before_data = data[0]
            after_data = data[1]
            stat, pvalue = scipy.stats.ranksums(
                before_data,
                after_data,
                'two-sided' # two-tailed test
            )
            row = f"{corridor['label']},{time['label']}"
            row += f",{round(numpy.mean(before_data),2)},{round(numpy.mean(after_data),2)}"
            row += f",{round(pvalue,6) if pvalue < 0.05 else ''}"
            row += f",{round(numpy.mean(after_data) - numpy.mean(before_data),2) if pvalue < 0.05 else ''}"
            print(row)
            #print(
            #    f'\tTravel time distributions differ with a P-value of {pvalue}'
            #    if pvalue < sig_level else
            #    f'\tTravel times are not significantly different' 
            #)
            #if pvalue < sig_level:
            #    label += f' p={pvalue:.6}'

            # plot histograms side by side
            #from matplotlib import pyplot
            #bins = numpy.linspace(0, 1000, 20)
            #pyplot.hist(data[0], bins, alpha=0.5, label='before')
            #pyplot.hist(data[1], bins, alpha=0.5, label='after')
            #pyplot.legend()
            #pyplot.title(label)
            #pyplot.savefig(f"./histogram-{label}.png")
            #pyplot.close()