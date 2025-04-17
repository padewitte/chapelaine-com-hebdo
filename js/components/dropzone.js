import { DomUtils } from '../core/dom-utils.js';
import { FileHandler } from '../core/file-handler.js';

export const Dropzone = {
    init() {
        this.dropZone = DomUtils.getElement('dropZone');
        this.bindEvents();
    },

    bindEvents() {
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
    },

    handleDragOver(e) {
        e.preventDefault();
        DomUtils.addClass(this.dropZone, 'hover');
    },

    handleDragLeave() {
        DomUtils.removeClass(this.dropZone, 'hover');
    },

    async handleDrop(e) {
        e.preventDefault();
        DomUtils.removeClass(this.dropZone, 'hover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            try {
                const results = await FileHandler.processFiles(files);
                this.onFilesProcessed(results);
            } catch (error) {
                console.error('Error processing files:', error);
                // TODO: Show error message to user
            }
        }
    },

    onFilesProcessed(results) {
        // This method should be overridden by the page that uses the dropzone
        console.log('Files processed:', results);
    }
}; 