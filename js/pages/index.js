import HandballApp from '../core/app.js';
import { DomUtils } from '../core/dom-utils.js';
import { DateUtils } from '../core/date-utils.js';
import { Dropzone } from '../components/dropzone.js';
import { DataExtractor } from '../core/extractor.js';
import { DropzoneUI, DownloadUI, BaseUI, generer_semaine, attach_btn_param, loadParametres } from '../ui/ui-behaviors.js';

class IndexPage extends HandballApp {
    constructor() {
        super();
        this.weeks = [];
    }

    initializePage() {
        this.initializeWeekSelector();
        this.initializeButtons();
        DropzoneUI.attachDropZone();
        attach_btn_param();
        this.attachBtnGeneration();
        this.attachBtnDl("resultats");
        this.attachBtnDl("samedi");
        this.attachBtnDl("dimanche");
        loadParametres();
    }

    initializeWeekSelector() {
        this.weekSelector = DomUtils.getElement('selSemaine');
        this.weekSelector?.addEventListener('sl-change', (e) => {
            this.generateWeek(e.target.value);
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
            generer_semaine(selSemaine.value);
            BaseUI.scrollToMainSection('sctProgrammeEtResultat')
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
        generer_semaine(week)
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