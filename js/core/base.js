// Common HTML elements that are shared across all pages
const commonElements = {
    head: `
        <meta charset="utf-8">
        <!-- Css-->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.13.1/cdn/themes/light.css" />
        <link rel="stylesheet" href="./generation-visuel.css" />

        <!-- Javascript -->
        <!-- UI web components -->
        <script type="module"
            src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.13.1/cdn/shoelace-autoloader.js"></script>
        <!-- CSV Parser -->
        <script src="https://cdn.jsdelivr.net/npm/d3-dsv@3"></script>
        <!-- Utilities to manipulate structures -->
        <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>

        <!-- Date manipulation-->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.js"></script>

        <!-- Image generator-->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

        <!-- Fonts-->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans&display=swap" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Contrail+One" />
        <link href="https://fonts.cdnfonts.com/css/edo" rel="stylesheet">
    `,
    paramsDialog: `
        <sl-dialog label="Paramètres" class="dialog-scrolling">
            <form id="form_param" class="configuration">
                <div>Nom des équipes locales</div>
                <textarea id="noms_equipes_dom"></textarea>
                <sl-divider></sl-divider>
                <div>Substitions équipes</div>
                <sl-alert variant="primary" open>
                    <sl-icon slot="icon" name="info-circle"></sl-icon>
                    Ajouter ici les noms d'équipe que vous souhaitez voir afficher
                    sous
                    une forme plus "humaine"
                </sl-alert>
                <textarea id="substitution_equipes"></textarea>
                <sl-divider></sl-divider>

                <div>Configuration des équipes</div>
                <sl-alert variant="primary" open>
                    <sl-icon slot="icon" name="info-circle"></sl-icon>
                    Format (division:{collectif:"nom collectif","nom
                    equipe":"libellé court"}). Utiliser les logs de la console pour compléter en pensant à faire une PR.
                </sl-alert>
                <textarea id="configuration_equipe"></textarea>
            </form>
            <sl-button slot="footer" variant="primary">Save</sl-button>
        </sl-dialog>
        <sl-button id="btn-param" variant="default" size="large">
            <sl-icon slot="prefix" name="gear"></sl-icon>
            Paramètres
        </sl-button>
    `,
    uploadSection: (weekSelector = '', buttons = '') => `
        <section>
            <h2>Upload des fichiers</h2>
            <sl-alert variant="primary" open>
                <sl-icon slot="icon" name="info-circle"></sl-icon>
                Fichiers résultats et matchs à venir à générer depuis Gest'hand
            </sl-alert>
            <div id="dropZone">Glisser les fichiers CSV ici</div>
            ${weekSelector}
            ${buttons}
        </section>
    `
};

// Function to initialize common elements
function initializeCommonElements(selector, buttons) {
    // Add head content
    document.head.innerHTML = commonElements.head;
    
    // Add params dialog and button
    document.body.insertAdjacentHTML('afterbegin', commonElements.paramsDialog);    
    document.body.insertAdjacentHTML('afterbegin', commonElements.uploadSection(selector, buttons));
    
    // Load common scripts
    const commonScripts = [
        'js/default-param.js',
        'js/ui-behaviors.js',
        'js/extractor.js',
        'js/data-cleaner.js'
    ];
    
    commonScripts.forEach(script => {
        const scriptElement = document.createElement('script');
        scriptElement.src = script;
        document.body.appendChild(scriptElement);
    });
}

// Export the initialization function
window.initializeCommonElements = initializeCommonElements; 