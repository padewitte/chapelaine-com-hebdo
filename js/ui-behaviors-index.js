function attachBtnGeneration() {
    const selSemaine = document.getElementById('selSemaine');
    const btnGeneration = document.getElementById('btnGeneration');
    btnGeneration.addEventListener('click', function (e) {
        e.preventDefault();
        generer_semaine(selSemaine.value);
        scrollToMainSection('sctProgrammeEtResultat')
    });
}

function attachBtnDl(suffix) {
    const btnDl = document.getElementById('btnDl_' + suffix);
    btnDl.addEventListener('click', function (e) {
        const semaine = document.getElementById('selSemaine').value;
        e.preventDefault();
        downloadDivAsImage("insta_" + suffix, "file-" + semaine + "-" + suffix)
    });
}

document.addEventListener('DOMContentLoaded', function () {
    attach_btn_param();
    attachDropZone();
    attachBtnGeneration();
    attachBtnDl("resultats");
    attachBtnDl("samedi");
    attachBtnDl("dimanche");
    loadParametres();
});