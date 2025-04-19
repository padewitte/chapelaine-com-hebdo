import HandballApp from '../core/app.js';
import { DomUtils } from '../core/dom-utils.js';
import { Config } from '../core/config.js';
import { DateUtils } from '../core/date-utils.js';
import { DataExtractor } from '../core/extractor.js';
import { DropzoneUI } from '../components/dropzone-ui.js';

class ChampionnatsPage extends HandballApp {
    constructor() {
        super();
        this.championships = [];
        this.selectedChampionship = null;
    }

    initializePage() {
        this.initializeChampionshipSelector();
        this.initializeButtons();
        DropzoneUI.attachDropZone();
    }

    initializeChampionshipSelector() {
        this.championshipSelector = DomUtils.getElement('selChampionnat');
        this.championshipSelector.addEventListener('sl-change', (e) => {
            this.selectedChampionship = e.target.value;
            this.generateChampionshipView();
        });
    }

    initializeButtons() {
        const generateButton = DomUtils.getElement('btnGenerationChamp');
        generateButton.addEventListener('click', () => {
            this.generateChampionshipView();
            TabManager.scrollToSection('sctChampionnat');
        });
    }

    updateChampionshipSelector() {
        DomUtils.setAttribute(this.championshipSelector, 'disabled', true);
        DomUtils.removeAllChildNodes(this.championshipSelector);
        
        if (this.championships.length > 0) {
            const defaultOption = DomUtils.createElement('sl-option');
            DomUtils.appendChild(this.championshipSelector, defaultOption);

            this.championships.forEach(championship => {
                const option = DomUtils.createElement('sl-option');
                option.value = championship;
                option.innerHTML = championship;
                DomUtils.appendChild(this.championshipSelector, option);
            });

            DomUtils.removeAttribute(this.championshipSelector, 'disabled');
        }
    }

    isHomeMatch(match) {
        return Config.getLocalTeams().includes(match['club rec']);
    }

    generateChampionshipView() {
        const championshipSection = DomUtils.getElement('sctChampionnat');
        if (!championshipSection) return;

        // Clear existing content
        DomUtils.clearElement(championshipSection);

        if (!this.selectedChampionship) {
            // Show message if no championship selected
            const noSelectionMessage = DomUtils.createElement('div', 'no-selection-message');
            noSelectionMessage.innerHTML = 'Veuillez sélectionner un championnat.';
            DomUtils.appendChild(championshipSection, noSelectionMessage);
            return;
        }

        const matches = DataExtractor.MATCHS_PROGRAMMES_PAR_CHAMP.get(this.selectedChampionship);
        if (!matches || matches.length === 0) {
            const noMatchesMessage = DomUtils.createElement('div', 'no-matches-message');
            noMatchesMessage.innerHTML = 'Aucun match programmé pour ce championnat.';
            DomUtils.appendChild(championshipSection, noMatchesMessage);
            return;
        }

        // Add championship title
        const title = DomUtils.createElement('h2', 'titre-champ');
        title.innerHTML = this.selectedChampionship;
        DomUtils.appendChild(championshipSection, title);

        // Create matches table
        const table = DomUtils.createElement('table', 'tableau-champ');
        const tbody = DomUtils.createElement('tbody');

        matches.forEach(match => {
            const row = DomUtils.createElement('tr');
            
            // Add match details
            const cells = [
                match.J, // Day
                this.isHomeMatch(match) ? match['club vis'] : match['club rec'], // Opponent   
                match.le ? match.le : DateUtils.getSaturdayDate(match.semaine), // Date
                match.le ? match.horaire : '00:00:00', // Time
                match.Ville ? match['nom salle'] : 'Lieu inconnu', // Venue name
                match.Ville ? `${match['adresse salle']}, ${match.Ville}` : '', // Venue address
                this.isHomeMatch(match) ? 'À domicile' : 'Extérieur' // Match type
            ];

            cells.forEach(cellContent => {
                const cell = DomUtils.createElement('td');
                cell.innerHTML = cellContent;
                DomUtils.appendChild(row, cell);
            });

            DomUtils.appendChild(tbody, row);
        });

        DomUtils.appendChild(table, tbody);
        DomUtils.appendChild(championshipSection, table);
    }
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChampionnatsPage();
}); 