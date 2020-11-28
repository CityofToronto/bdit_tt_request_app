
export function parseTimePeriods(DatetimeRanges) {
    let timePeriods = [];
    let succeeded = true;
    DatetimeRanges.forEach(value => {
        let params = value.getParams();
        if (!succeeded || !params || !params.startDate || !params.endDate || !params.startTime || !params.endTime) {
            succeeded = false;
            return;
        }

        const startDateStr = formattedDateString(params.startDate);
        const endDateStr = formattedDateString(params.endDate);
        const startTimeStr = formattedTimeString(params.startTime);
        const endTimeStr = formattedTimeString(params.endTime);

        timePeriods.push({
            "start_time": startTimeStr,
            "end_time": endTimeStr,
            "start_date": startDateStr,
            "end_date": endDateStr,
            "days_of_week": params.daysOfWeek,
            "include_holidays": params.includeHolidays
        });
    });

    if (succeeded) {
        return timePeriods;
    } else {
        return null;
    }
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

function zeroPadNumber(number) {
    let padded = number.toString();
    if (padded.length < 2) {
        padded = "0" + padded;
    }
    return padded;
}


export default parseTimePeriods;