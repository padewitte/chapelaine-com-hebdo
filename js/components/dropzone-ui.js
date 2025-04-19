import { BaseUI } from './base-ui.js';
import { DataExtractor } from '../core/extractor.js';
import { DateUtils } from '../core/date-utils.js';
import { StatsUI } from './stats-ui.js';

export class DropzoneUI extends BaseUI {
    static attachDropZone() {
        const dropZone = document.getElementById('dropZone');

        dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            dropZone.classList.add('hover');
        });

        dropZone.addEventListener('dragleave', function () {
            dropZone.classList.remove('hover');
        });

        dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropZone.classList.remove('hover');
            DataExtractor.SEMAINES = [];

            const files = e.dataTransfer.files;

            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];

                    if (file.type === 'text/csv' || file.type === 'text/txt') {
                        const fileName = file.name;
                        const reader = new FileReader();

                        reader.onload = function (event) {
                            console.log('onload');
                            const csvContent = event.target.result;
                            const csv = d3.dsvFormat(";");
                            const data = csv.parse(csvContent);
                            let nouveauFichier = [];
                            if (data && data[0] && data[0]['Etat']) {
                                nouveauFichier = { type: 'resultat', data, fileName }
                            } else {
                                nouveauFichier = { type: 'programme', data, fileName }
                            }
                            console.log(nouveauFichier)
                            DataExtractor.extractData(nouveauFichier)
                            DropzoneUI.updateWeeks(DataExtractor.SEMAINES)
                            DropzoneUI.updateChampionship(DataExtractor.CHAMP)
                            DropzoneUI.updateStats()
                        };

                        reader.onerror = function (event) {
                            console.error('File could not be read! Code ' + event.target.error.code);
                        };

                        reader.readAsText(file);
                    } else {
                        console.error('Unsupported file type: ', file.type);
                    }
                }
            }

            BaseUI.minimizeUploadAndShowDataSelector()
        });
    }

    static updateWeeks(semaines) {
        const selSemaine = document.getElementById("selSemaine");
        if(selSemaine){
            selSemaine.setAttribute('disabled', true)
            this.removeAllChildNodes(selSemaine);
            if(semaines && semaines.length > 0){
                selSemaine.appendChild(document.createElement("sl-option"));
                semaines.forEach(semaine => {
                    let libSemaine = DateUtils.getLibSemaine(semaine)
                    const newDiv = document.createElement("sl-option");
                    newDiv.value = semaine
                    newDiv.innerHTML = libSemaine
                    selSemaine.appendChild(newDiv);
                });
                selSemaine.removeAttribute('disabled')
            }
        }
    }

    static updateChampionship(championnats) {
        const selChampionnat = document.getElementById("selChampionnat");
        if(selChampionnat){
            selChampionnat.setAttribute('disabled', true)
            this.removeAllChildNodes(selChampionnat);
            if(championnats && championnats.length > 0){
                selChampionnat.appendChild(document.createElement("sl-option"));
                championnats.forEach(championnat => {
                    const newDiv = document.createElement("sl-option");
                    newDiv.value = championnat
                    newDiv.innerHTML = championnat
                    selChampionnat.appendChild(newDiv);
                });
                selChampionnat.removeAttribute('disabled')
            }
        }
    }

    static updateStats() {
        const sctStats = document.getElementById("sctStats");
        if(sctStats){
            StatsUI.loadStats()
        }
    }
} 