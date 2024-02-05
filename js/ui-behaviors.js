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



document.addEventListener('DOMContentLoaded', function () {
    attach_btn_param();
    attachDropZone();
});


function majSemaines(semaines){
    const selSemaine = document.getElementById("selSemaine");
    removeAllChildNodes(selSemaine);
    semaines.forEach(semaine => {
        // <sl-option value="option-1">Sem. 1 (27/01 & 28/01)</sl-option>
        const semMom = moment(semaine,'YYYY-WW').add(5, 'days')
        let libSemaine = semaine  + " (" + semMom.format('DD/MM') + " & " + semMom.add(1, 'days').format('DD/MM') + ")"
        const newDiv = document.createElement("sl-option");
        newDiv.value = semaine
        newDiv.innerHTML = libSemaine
        selSemaine.appendChild(newDiv);
    });
}