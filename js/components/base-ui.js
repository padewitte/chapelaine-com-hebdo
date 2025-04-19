import { Configuration } from '../core/default-param.js';

export class BaseUI {
    static removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    static createHtmlElement(type, className, innerHtml) {
        const newDiv = document.createElement(type);
        newDiv.className = className + " hbgenerated";
        newDiv.innerHTML = innerHtml;
        return newDiv;
    }


    static loadParametres() {
        document.getElementById('noms_equipes_dom').innerHTML = JSON.stringify(Configuration.noms_equipes_dom, null, '  ')
        document.getElementById('substitution_equipes').innerHTML = JSON.stringify(Configuration.sub_equipes, null, '  ')
        document.getElementById('configuration_equipe').innerHTML = JSON.stringify(Configuration.configurationEquipe, null, '  ')
    }

    static attachBtnParam() {
        const dialog = document.querySelector('.dialog-scrolling');
        const openButton = dialog.nextElementSibling;
        const closeButton = dialog.querySelector('sl-button[slot="footer"]');

        openButton.addEventListener('click', () => dialog.show());
        closeButton.addEventListener('click', () => dialog.hide());
    }
} 