const Presets = Object.freeze({
    'AM Peak': {
        startTime: new Date("2018-09-30 07:00:00"),
        endTime: new Date("2018-09-30 10:00:00"),
        preset: 'AM Peak'
    },
    'PM Peak': {
        startTime: new Date("2018-09-30 16:00:00"),
        endTime: new Date("2018-09-30 18:00:00"),
        preset: 'PM Peak'
    },

    getParams(preset){
        switch (preset){
            case 'AM Peak':
                return this["AM Peak"]

            case 'PM Peak':
                return this["PM Peak"]

            default:
                return {}
        }
    },

    getPresets(){
        return ['AM Peak', 'PM Peak']
    }
});

export default Presets;