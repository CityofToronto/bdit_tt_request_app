const Days = Object.freeze({
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,

    getDay(index){
        switch(index){
            case 0:
                return "Monday";

            case 1:
                return "Tuesday";

            case 2:
                return "Wednesday";

            case 3:
                return "Thursday";

            case 4:
                return "Friday";

            case 5:
                return "Saturday";

            case 6:
                return "Sunday";

            default:
                return ""
        }
    }
});

export default Days;