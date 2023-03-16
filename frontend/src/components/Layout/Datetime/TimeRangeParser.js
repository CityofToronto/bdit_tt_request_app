
function parseTimePeriods(TimeRanges) {
    let listOfTimePeriods = [];
    TimeRanges.forEach(value => {
        let parsedRange;
        if(!listOfTimePeriods || !(parsedRange = parseRange(value))){
            return null;
        } else {
            listOfTimePeriods.push(parsedRange)
        }
    });

    return listOfTimePeriods;
}

function parseRange(range){
    let params = range.getParams();
    if (!params || !params.startTime || !params.endTime || !params.name) {
        return null;
    }

    const startTimeStr = formattedTimeString(params.startTime);
    const endTimeStr = formattedTimeString(params.endTime);
    const name = params.name;

    return {
        "start_time": startTimeStr,
        "end_time": endTimeStr,
        "name": name
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