import HandballApp from '../core/app.js';
import { DomUtils } from '../core/dom-utils.js';
import { DropzoneUI } from '../components/dropzone-ui.js';

class StatsPage extends HandballApp {
    constructor() {
        super();
        this.statsData = null;
    }

    initializePage() {
        DropzoneUI.attachDropZone(this);
    }

    generateStatRow(row) {
        const tr = DomUtils.createElement('tr');
        const td1 = DomUtils.createElement('td');
        const td2 = DomUtils.createElement('td');
        td1.innerHTML = row[0];
        td2.innerHTML = row[1];
        DomUtils.appendChild(tr, td1);
        DomUtils.appendChild(tr, td2);
        return tr;
    }

    updateStats(newStats) {
        this.statsData = newStats;
        const statsSection = DomUtils.getElement('sctStats');
        // Clear existing stats
        DomUtils.clearElement(statsSection);

        if (!this.statsData) {
            // Show message if no stats data
            const noDataMessage = DomUtils.createElement('div', 'no-stats-message');
            noDataMessage.innerHTML = 'Aucune donnée statistique disponible. Veuillez charger des fichiers CSV.';
            DomUtils.appendChild(statsSection, noDataMessage);
            return;
        }

        // Generate stats tables
        this.generateStatsTable(this.statsData.ARBITRES, 'ARBITRES');
        this.generateStatsTable(this.statsData.TABLES, 'TABLES');
        this.generateStatsTable(this.statsData.TUTEURS, 'TUTEURS');
        this.generateStatsTable(this.statsData.SUIVEURS, 'SUIVEURS');
        this.generateStatsTable(this.statsData.SALLES, 'SALLES');
        this.generateStatsTable(this.statsData.IMPLICATION_POINTS, 'IMPLICATION_POINTS');
    }

    generateStatsTable(statsArray, title) {
        const statsSection = DomUtils.getElement('sctStats');
        
        // Add title
        const titleElement = DomUtils.createElement('h2', 'titre-champ');
        titleElement.innerHTML = title;
        DomUtils.appendChild(statsSection, titleElement);

        // Create table
        const table = DomUtils.createElement('table', 'tableau-stat');
        
        // Add rows
        statsArray.forEach(stat => {
            const row = this.generateStatRow(stat);
            DomUtils.appendChild(table, row);
        });

        DomUtils.appendChild(statsSection, table);
    }
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StatsPage();
}); 