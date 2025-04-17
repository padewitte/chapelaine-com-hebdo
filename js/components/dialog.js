import { DomUtils } from '../core/dom-utils.js';
import { Config } from '../core/config.js';

export const Dialog = {
    init() {
        this.dialog = document.querySelector('.dialog-scrolling');
        this.openButton = this.dialog.nextElementSibling;
        this.closeButton = this.dialog.querySelector('sl-button[slot="footer"]');
        this.form = this.dialog.querySelector('#form_param');

        this.bindEvents();
        this.loadConfig();
    },

    bindEvents() {
        this.openButton.addEventListener('click', () => this.dialog.show());
        this.closeButton.addEventListener('click', () => this.saveAndClose());
    },

    loadConfig() {
        const localTeams = Config.getLocalTeams();
        const teamSubstitutions = Config.getTeamSubstitutions();
        const teamConfig = Config.getTeamConfig();

        this.form.querySelector('#noms_equipes_dom').value = JSON.stringify(localTeams, null, 2);
        this.form.querySelector('#substitution_equipes').value = JSON.stringify(teamSubstitutions, null, 2);
        this.form.querySelector('#configuration_equipe').value = JSON.stringify(teamConfig, null, 2);
    },

    saveAndClose() {
        try {
            const localTeams = JSON.parse(this.form.querySelector('#noms_equipes_dom').value);
            const teamSubstitutions = JSON.parse(this.form.querySelector('#substitution_equipes').value);
            const teamConfig = JSON.parse(this.form.querySelector('#configuration_equipe').value);

            Config.updateConfig({
                localTeams,
                teamSubstitutions,
                teamConfig
            });

            this.dialog.hide();
        } catch (error) {
            console.error('Error parsing configuration:', error);
            // TODO: Show error message to user
        }
    }
}; 