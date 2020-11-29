const Presets = Object.freeze({
    'Working Week Morning': {
        daysOfWeek: [true, true, true, true, true, false, false],
        startTime: new Date("2018-09-30 06:00:00"),
        endTime: new Date("2018-09-30 09:00:00"),
        includeHolidays: false,
        preset: 'Working Week Morning'
    },
    'Working Week Night': {
        daysOfWeek: [true, true, true, true, true, false, false],
        startTime: new Date("2018-09-30 15:00:00"),
        endTime: new Date("2018-09-30 18:00:00"),
        includeHolidays: false,
        preset: 'Working Week Night'
    },

    getParams(preset){
        switch (preset){
            case 'Working Week Morning':
                return this["Working Week Morning"]

            case 'Working Week Night':
                return this["Working Week Night"]

            default:
                return {}
        }
    },

    getPresets(){
        return ['Working Week Morning', 'Working Week Night']
    }
});

export default Presets;