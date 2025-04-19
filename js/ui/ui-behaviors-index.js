import { DataCleaner } from '../core/data-cleaner.js';
import { DataExtractor } from '../core/extractor.js';
import { Configuration } from '../core/default-param.js';
import { generer_semaine, attach_btn_param, loadParametres } from '../ui/ui-behaviors.js';
import { DropzoneUI, DownloadUI, BaseUI } from '../ui/ui-behaviors.js';

function attachBtnGeneration() {
    const selSemaine = document.getElementById('selSemaine');
    const btnGeneration = document.getElementById('btnGeneration');
    btnGeneration.addEventListener('click', function (e) {
        e.preventDefault();
        generer_semaine(selSemaine.value);
        BaseUI.scrollToMainSection('sctProgrammeEtResultat')
    });
}

function attachBtnDl(suffix) {
    const btnDl = document.getElementById('btnDl_' + suffix);
    btnDl.addEventListener('click', function (e) {
        const semaine = document.getElementById('selSemaine').value;
        e.preventDefault();
        DownloadUI.downloadDivAsImage("insta_" + suffix, "file-" + semaine + "-" + suffix)
    });
}

document.addEventListener('DOMContentLoaded', function () {
    attach_btn_param();
    DropzoneUI.attachDropZone();
    attachBtnGeneration();
    attachBtnDl("resultats");
    attachBtnDl("samedi");
    attachBtnDl("dimanche");
    loadParametres();
});