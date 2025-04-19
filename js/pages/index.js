import HandballApp from '../core/app.js';
import { DomUtils } from '../core/dom-utils.js';
import { DateUtils } from '../core/date-utils.js';
import { BaseUI } from '../components/base-ui.js';
import { DropzoneUI } from '../components/dropzone-ui.js';
import { MatchUI } from '../components/match-ui.js';
import { DownloadUI } from '../components/download-ui.js';
import { TabManager } from '../components/tab-manager.js';

class IndexPage extends HandballApp {
    constructor() {
        super();
        this.weeks = [];
    }

    initializePage() {
        this.initializeWeekSelector();
        this.initializeButtons();
        DropzoneUI.attachDropZone();
        BaseUI.attachBtnParam();
        this.attachBtnGeneration();
        this.attachBtnDl("resultats");
        this.attachBtnDl("samedi");
        this.attachBtnDl("dimanche");
        BaseUI.loadParametres();
    }

    initializeWeekSelector() {
        this.weekSelector = DomUtils.getElement('selSemaine');
        this.weekSelector?.addEventListener('sl-change', (e) => {
            this.generateWeek(e.target.value);
            TabManager.scrollToSection('sctProgrammeEtResultat')
        });
    }

    initializeButtons() {
        const generateButton = DomUtils.getElement('btnGeneration');
        generateButton?.addEventListener('click', () => this.generateVisuals());
    }


    attachBtnDl(suffix) {
        const btnDl = document.getElementById('btnDl_' + suffix);
        btnDl.addEventListener('click', function (e) {
            const semaine = document.getElementById('selSemaine').value;
            e.preventDefault();
            DownloadUI.downloadDivAsImage("insta_" + suffix, "file-" + semaine + "-" + suffix)
        });
    }

    attachBtnGeneration() {
        const selSemaine = document.getElementById('selSemaine');
        const btnGeneration = document.getElementById('btnGeneration');
        btnGeneration.addEventListener('click', function (e) {
            e.preventDefault();
            MatchUI.genererSemaine(selSemaine.value);
            TabManager.scrollToSection('sctProgrammeEtResultat')
        });
    }

    updateWeekSelector() {
        DomUtils.setAttribute(this.weekSelector, 'disabled', true);
        DomUtils.removeAllChildNodes(this.weekSelector);
        
        if (this.weeks.length > 0) {
            const defaultOption = DomUtils.createElement('sl-option');
            DomUtils.appendChild(this.weekSelector, defaultOption);

            this.weeks.forEach(week => {
                const option = DomUtils.createElement('sl-option');
                option.value = week;
                option.innerHTML = DateUtils.getWeekLabel(week);
                DomUtils.appendChild(this.weekSelector, option);
            });

            DomUtils.removeAttribute(this.weekSelector, 'disabled');
        }
    }

    generateWeek(week){
        MatchUI.genererSemaine(week);
    }

    generateVisuals() {
        // Implementation of visual generation
        console.log('Generating visuals...');
    }

}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IndexPage();
}); 