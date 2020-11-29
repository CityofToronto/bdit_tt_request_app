
export function parseTimePeriods(DatetimeRanges) {
    let timePeriods = [];
    DatetimeRanges.forEach(value => {
        let parsedRange;
        if(!timePeriods || !(parsedRange = parseRange(value))){
            return null;
        } else {
            timePeriods.push(parsedRange)
        }
    });

    return timePeriods;
}

function parseRange(range){
    let params = range.getParams();
    if (!params || !params.startDate || !params.endDate || !params.startTime || !params.endTime) {
        return null;
    }

    const startDateStr = formattedDateString(params.startDate);
    const endDateStr = formattedDateString(params.endDate);
    const startTimeStr = formattedTimeString(params.startTime);
    const endTimeStr = formattedTimeString(params.endTime);

    return {
        "start_time": startTimeStr,
        "end_time": endTimeStr,
        "start_date": startDateStr,
        "end_date": endDateStr,
        "days_of_week": params.daysOfWeek,
        "include_holidays": params.includeHolidays
    };
}

export function formattedDateString(datetime) {
    const year = datetime.getFullYear();
    const month = zeroPadNumber(datetime.getMonth() + 1);
    const date = zeroPadNumber(datetime.getDate());

    return `${year}-${month}-${date}`;
}

export function formattedTimeString(datetime) {
    const hour = zeroPadNumber(datetime.getHours());
    const minute = zeroPadNumber(datetime.getMinutes());

    return `${hour}:${minute}`;
}

export function parseTime(string){
    let parts = string.split(":");
    const hour = zeroPadNumber(parseInt(parts[0]));
    const minute = zeroPadNumber(parseInt(parts[1]));

    return `${hour}:${minute}`;
}

function zeroPadNumber(number) {
    let padded = number.toString();
    if (padded.length < 2) {
        padded = "0" + padded;
    }
    return padded;
}


export default parseTimePeriods;