import { BaseUI } from './base-ui.js';
import { DataExtractor } from '../core/extractor.js';

export class StatsUI extends BaseUI {
    static loadStats() {
        const sctStats = document.getElementById("sctStats");
        if (!sctStats) return;

        // Clear existing stats
        this.removeAllChildNodes(sctStats);

        // Sort stats
        DataExtractor.sortStats();

        // Create tables for each stat type
        const statTypes = ['SUIVEURS', 'ARBITRES', 'TABLES', 'TUTEURS', 'SALLES', 'IMPLICATION_POINTS'];
        statTypes.forEach(statType => {
            const table = this.createHtmlElement('table', 'stats-table', '');
            const thead = this.createHtmlElement('thead', '', '<tr><th>Nom</th><th>Nombre</th></tr>');
            const tbody = this.createHtmlElement('tbody', '', '');

            const stats = DataExtractor.STATS[statType];
            if (stats) {
                stats.forEach(stat => {
                    const tr = this.createHtmlElement('tr', '', `<td>${stat[0]}</td><td>${stat[1]}</td>`);
                    tbody.appendChild(tr);
                });
            }

            table.appendChild(thead);
            table.appendChild(tbody);
            sctStats.appendChild(table);
        });
    }
} 