import { BaseUI } from './base-ui.js';
import { DataExtractor } from '../core/extractor.js';

export class DropzoneUI extends BaseUI {
    static attachDropZone(page) {
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
            let filesToProcess = 0;
            let processedFiles = 0;

            if (files.length > 0) {
                // Count valid files to process
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.type === 'text/csv' || file.type === 'text/txt') {
                        filesToProcess++;
                    }
                }

                // If no valid files, show error and return
                if (filesToProcess === 0) {
                    console.error('No valid CSV or TXT files found');
                    return;
                }
                DataExtractor.clean()
                // Process each file
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];

                    if (file.type === 'text/csv' || file.type === 'text/txt') {
                        const fileName = file.name;
                        const reader = new FileReader();

                        reader.onload = function (event) {
                            console.log('Processing file:', fileName);
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

                            // Increment processed counter
                            processedFiles++;
                            
                            // Check if all files are processed
                            if (processedFiles === filesToProcess) {
                                console.log('All files processed successfully');
                                DropzoneUI.uploadComplete(page);
                            }
                        };

                        reader.onerror = function (event) {
                            console.error('File could not be read! Code ' + event.target.error.code);
                            processedFiles++;
                            if (processedFiles === filesToProcess) {
                                DropzoneUI.uploadComplete(page)
                            }
                        };

                        reader.readAsText(file);
                    } else {
                        console.error('Unsupported file type: ', file.type);
                    }
                }
            }
        });
    }
    static refreshDataExtractor(page) {
        page.updateWeekSelector(DataExtractor.SEMAINES)
        page.updateChampionshipSelector(DataExtractor.CHAMP)
        page.updateStats(DataExtractor.STATS)
        BaseUI.minimizeUploadAndShowDataSelector();
    }

    static uploadComplete(page) {
        DropzoneUI.refreshDataExtractor(page)
        //Store DataExtractor in local storage
        localStorage.setItem('DataExtractor', JSON.stringify(DataExtractor));
    }

    static loadDataExtractor(page) {
        const dataExtractor = localStorage.getItem('DataExtractor');
        if (dataExtractor && dataExtractor !== 'undefined') {
            DataExtractor.load(JSON.parse(dataExtractor));
        }
        DropzoneUI.refreshDataExtractor(page)
    }

} 