import { Config } from './config.js';
import { Dropzone } from '../components/dropzone.js';
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
    }

    initializePage() {
        // This will be overridden by page-specific initialization
        console.log('Base app initialized');
    }
}

// Export the app class
export default HandballApp; 