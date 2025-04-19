import HandballApp from '../core/app.js';
import { DomUtils } from '../core/dom-utils.js';
import { DateUtils } from '../core/date-utils.js';
import { Dropzone } from '../components/dropzone.js';
import { DataExtractor } from '../core/extractor.js';
import { generer_semaine } from '../ui/ui-behaviors.js';


class IndexPage extends HandballApp {
    constructor() {
        super();
        this.weeks = [];
    }

    initializePage() {
        this.initializeWeekSelector();
        this.initializeButtons();
        this.initializeDropzone();
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

    initializeDropzone() {
        Dropzone.onFilesProcessed = (results) => {
            results.forEach(result => {
                DataExtractor.extraireData(result);
            });
            this.weeks = DataExtractor.SEMAINES;
            this.updateWeekSelector();
        };
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