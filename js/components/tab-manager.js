import { DomUtils } from '../core/dom-utils.js';

export const TabManager = {
    init() {
        this.tabs = {
            resultat: DomUtils.getElement('tab_resultat'),
            samedi: DomUtils.getElement('tab_samedi'),
            dimanche: DomUtils.getElement('tab_dimanche'),
            kiefekoi: DomUtils.getElement('tab_kiefeKoi')
        };

        this.alerts = {
            samedi: DomUtils.getElement('alert_samedi'),
            dimanche: DomUtils.getElement('alert_dimanche'),
            resultats: DomUtils.getElement('alertResultats')
        };
    },

    resetAllTabs() {
        Object.values(this.tabs).forEach(tab => {
            DomUtils.removeAttribute(tab, 'active');
            DomUtils.setAttribute(tab, 'disabled', true);
        });

        Object.values(this.alerts).forEach(alert => {
            DomUtils.removeAttribute(alert, 'open');
        });

        document.querySelectorAll('.hbgenerated').forEach(element => {
            element.remove();
        });

        const resultats = DomUtils.getElement('resultats');
        DomUtils.clearElement(resultats);
    },

    enableTab(tabId) {
        const tab = this.tabs[tabId];
        if (tab) {
            DomUtils.removeAttribute(tab, 'disabled');
        }
    },

    showAlert(alertId) {
        const alert = this.alerts[alertId];
        if (alert) {
            DomUtils.setAttribute(alert, 'open', true);
        }
    },

    scrollToSection(sectionId) {
        const section = DomUtils.getElement(sectionId);
        if (section) {
            window.scrollTo({
                top: section.offsetTop,
                left: 0,
                behavior: 'smooth'
            });
        }
    }
}; 