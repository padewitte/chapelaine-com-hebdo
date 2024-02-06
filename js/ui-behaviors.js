function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function attach_btn_param() {
    const dialog = document.querySelector('.dialog-scrolling');
    const openButton = dialog.nextElementSibling;
    const closeButton = dialog.querySelector('sl-button[slot="footer"]');

    openButton.addEventListener('click', () => dialog.show());
    closeButton.addEventListener('click', () => dialog.hide());
}

function attachDropZone() {

    function majSemaines(semaines){
        const selSemaine = document.getElementById("selSemaine");
        selSemaine.setAttribute('disabled', true)
        
        removeAllChildNodes(selSemaine);
        semaines.forEach(semaine => {
            // <sl-option value="option-1">Sem. 1 (27/01 & 28/01)</sl-option>
            const semMom = moment(semaine,'YYYY-WW').add(5, 'days')
            let libSemaine = semaine  + " (" + semMom.format('DD/MM') + " & " + semMom.add(1, 'days').format('DD/MM') + ")"
            const newDiv = document.createElement("sl-option");
            newDiv.value = semaine
            newDiv.innerHTML = libSemaine
            selSemaine.appendChild(newDiv);
            selSemaine.removeAttribute('disabled')
        });
    }

    const dropZone = document.getElementById('dropZone');

    // Prevent default behavior (open as link for some elements)
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
        SEMAINES = [];

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
                        //console.log('CSV file content:', contents);
                        console.log(nouveauFichier)
                        extraireData(nouveauFichier)
                        majSemaines(SEMAINES)
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
    });
}







function attachBtnGeneration() {
    const selSemaine = document.getElementById('selSemaine');
    const btnGeneration = document.getElementById('btnGeneration');
    btnGeneration.addEventListener('click', function (e) {
        e.preventDefault();
        generer_semaine(selSemaine.value);
        //Scroll dans la section suivante
        window.scrollTo({
            top: document.getElementById('sctProgrammeEtResultat').offsetTop,
            left: 0,
            behavior: 'smooth'
          });
    });


}

function cleanGeneratedDiv(){
    document.querySelectorAll(".hbgenerated").forEach(e => e.remove())
    const resultats = document.getElementById("resultats");
    resultats.innerHTML = "";

}

function createHtmlElement(type, className, innerHtml) {
    const newDiv = document.createElement(type);
    newDiv.className = className + " hbgenerated";
    newDiv.innerHTML = innerHtml;
    return newDiv;
}

function insertLigneResultat(match){
    let resultats = document.getElementById("resultats");
    if(!match.fdme_rec || !match.fdme_vis){
        resultats = document.getElementById("erreursResultats");
        document.getElementById("alertResultats").setAttribute("open",true)
    }
    //Creation de la ligne de resultat HTML à afficher
    const newDiv = document.createElement("div");
    newDiv.className = "ligneResultat hbgenerated"
    //const newContent = document.createTextNode(nom_collectif_club + " : " + match['club rec'] + ":" +  match['fdme rec'] + " vs " + match['club vis'] + ":" + match['fdme vis']);
    newDiv.innerHTML = "<div class='lrl'>" + match.equipe_dom + "</div><div class='lrc " + match.victoire + "'>" + match.fdme_rec + " - " + match.fdme_vis + "</div><div class='lrr'>" + match.equipe_ext + "</div>";//+ " : " + equipe_ext;
    resultats.appendChild(newDiv);
}

document.addEventListener('DOMContentLoaded', function () {
    attach_btn_param();
    attachDropZone();
    attachBtnGeneration();
});

function generer_semaine(semaine){
    const matchsJoueClean = nettoyer_matchs(semaine, MATCHS_JOUES_PAR_SEMAINE);
    matchsJoueClean.forEach(match => {
        insertLigneResultat(match)
    })

}
