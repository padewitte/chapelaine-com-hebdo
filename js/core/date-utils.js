export const DateUtils = {
    getWeekLabel(week) {
        const saturday = moment(week, 'YYYY-WW').add(5, 'days');
        const sunday = moment(saturday).add(1, 'days');
        return `${week} (${saturday.format('DD/MM')} & ${sunday.format('DD/MM')})`;
    },

    getSaturdayDate(week) {
        return moment(week, 'YYYY-WW').add(5, 'days').format('DD/MM/YYYY');
    },

    formatDate(date, format = 'DD/MM/YYYY') {
        return moment(date).format(format);
    },

    isSameDay(date1, date2) {
        return moment(date1).isSame(date2, 'day');
    },

    isWeekend(date) {
        const day = moment(date).day();
        return day === 6 || day === 0; // 6 is Saturday, 0 is Sunday
    },
    formatHeure (string_heure){
        return string_heure.slice(0, -3);
    }
}; 