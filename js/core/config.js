export const Config = {
    _config: {
        localTeams: [],
        teamSubstitutions: {},
        teamConfig: {}
    },

    init() {
        this.loadFromStorage();
    },

    loadFromStorage() {
        const storedConfig = localStorage.getItem('handballConfig');
        if (storedConfig) {
            this._config = JSON.parse(storedConfig);
        }
    },

    saveToStorage() {
        localStorage.setItem('handballConfig', JSON.stringify(this._config));
    },

    getLocalTeams() {
        return this._config.localTeams;
    },

    getTeamSubstitutions() {
        return this._config.teamSubstitutions;
    },

    getTeamConfig() {
        return this._config.teamConfig;
    },

    updateConfig(newConfig) {
        this._config = { ...this._config, ...newConfig };
        this.saveToStorage();
    },

    getSubstitutedTeamName(teamName) {
        return this._config.teamSubstitutions[teamName] || teamName;
    },

    getTeamShortName(teamName) {
        const config = this._config.teamConfig;
        for (const division in config) {
            if (config[division][teamName]) {
                return config[division][teamName];
            }
        }
        return teamName;
    }
}; 