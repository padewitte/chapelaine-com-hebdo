import { Config } from './config.js';
import { Dropzone } from '../components/dropzone.js';
import { DropzoneUI } from '../components/dropzone-ui.js';
import { TabManager } from '../components/tab-manager.js';

class HandballApp {
    constructor() {
        this.init();
    }

    init() {
        // Initialize configuration
        Config.init();

        // Initialize components
        Dropzone.init();
        TabManager.init();

        // Initialize page-specific logic
        this.initializePage();
        DropzoneUI.loadDataExtractor(this);
    }

    initializePage() {
        // This will be overridden by page-specific initialization
        console.log('Base app initialized');
    }

    updateWeekSelector(newWeeks) {};

    updateChampionshipSelector(newChampionships) {};

    updateStats(newStats) {};


}

// Export the app class
export default HandballApp; 