// Common HTML elements that are shared across all pages
const commonElements = {
    head: `
        <meta charset="utf-8">
        <!-- Css-->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.13.1/cdn/themes/light.css" />
        <link rel="stylesheet" href="./css/generation-visuel.css" />

        <!-- Javascript -->
        <!-- UI web components -->
        <script type="module"
            src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.13.1/cdn/shoelace-autoloader.js"></script>

        <!-- Fonts-->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans&display=swap" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Contrail+One" />
        <link href="https://fonts.cdnfonts.com/css/edo" rel="stylesheet">
    `,
    uploadSection: (dataSelector = '') => `
            <a href="index.html">Kifekoi et visuels</a>
            <a href="stats.html">Statistiques</a>
            <a href="championnats.html">Championnats</a>
        </div>    
        <section>
            <div id="dropZone">
                Glisser les fichiers CSV GestHand Extraction ici

            </div>
            <sl-alert variant="primary" id="upload-alert" open>
                    <sl-icon slot="icon" name="info-circle"></sl-icon>
                    Fichiers résultats et matchs à venir à générer depuis Gest'hand
            </sl-alert>
            <div id="dataSelector">
                ${dataSelector}
            </div>
        </section>
    `
};

// Function to initialize common elements
function initializeCommonElements(dataSelector) {
    // Add head content
    document.head.innerHTML = commonElements.head;
    
    // Add params dialog and button    document.body.insertAdjacentHTML('afterbegin', commonElements.paramsDialog);    
    document.body.insertAdjacentHTML('afterbegin', commonElements.uploadSection(dataSelector));

    const externalScripts = [
        {
            src: 'https://cdn.jsdelivr.net/npm/d3-dsv@3',
            type: 'text/javascript'
        },
        {
            src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
            type: 'text/javascript'
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.js',
            type: 'text/javascript'
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
            type: 'text/javascript'
        }
    ];

    externalScripts.forEach(script => {
        const scriptElement = document.createElement('script');
        scriptElement.type = script.type;
        scriptElement.src = script.src;
        document.head.appendChild(scriptElement);
    });
    
}

// Export the initialization function
window.initializeCommonElements = initializeCommonElements; 