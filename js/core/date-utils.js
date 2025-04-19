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
    },

    getLibSemaine(semaine) {
        const semMom = moment(semaine, 'YYYY-WW').add(5, 'days')
        return semaine + " (" + semMom.format('DD/MM') + " & " + semMom.add(1, 'days').format('DD/MM') + ")"
    },

    getSamediSemaine(semaine) {
        const semMom = moment(semaine, 'YYYY-WW').add(5, 'days')
        return semMom.format('DD/MM/YYYY')
    },

    isWeekBeforeToday(week) {
        return moment(week,'YYYY-WW').isBefore(moment());
    },

    isWeekAfterToday(week) {
        return moment(week,'YYYY-WW').isAfter(moment());
    },

    chooseBestWeek(weeks) {
        const today = moment();
        const bestWeek = weeks.reverse().find(week => this.isWeekBeforeToday(week));
        if(bestWeek) {
            return bestWeek;
        }else{
            return weeks.reverse().find(week => this.isWeekAfterToday(week));
        }
    }
}; 