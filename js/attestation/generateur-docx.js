/**
 * Génération d'attestations DOCX à partir d'un modèle.
 * Utilise PizZip + Docxtemplater pour remplir les champs,
 * JSZip pour regrouper les fichiers, et FileSaver pour le téléchargement.
 *
 * Les bibliothèques sont chargées dynamiquement au premier usage.
 */

// État de chargement des bibliothèques
let libsChargees = false;

/**
 * Charge un script JS depuis une URL (CDN).
 * @param {string} url - URL du script à charger
 * @returns {Promise<void>}
 */
function chargerScript(url) {
  return new Promise((resolve, reject) => {
    // Vérifier si le script est déjà chargé
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Échec du chargement : ${url}`));
    document.head.appendChild(script);
  });
}

/**
 * Charge dynamiquement les bibliothèques nécessaires (PizZip, Docxtemplater, JSZip, FileSaver).
 * Ne charge qu'une seule fois.
 * @returns {Promise<void>}
 */
async function chargerBibliotheques() {
  if (libsChargees) return;

  const urls = [
    'https://cdn.jsdelivr.net/npm/pizzip@3/dist/pizzip.min.js',
    'https://cdn.jsdelivr.net/npm/docxtemplater@3/build/docxtemplater.min.js',
    'https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/file-saver@2/dist/FileSaver.min.js',
  ];

  // PizZip doit être chargé avant Docxtemplater
  await chargerScript(urls[0]);
  await chargerScript(urls[1]);
  // JSZip et FileSaver sont indépendants
  await Promise.all([chargerScript(urls[2]), chargerScript(urls[3])]);

  libsChargees = true;
}

/**
 * Formate la date du jour en format français JJ/MM/AAAA.
 * @returns {string}
 */
function obtenirDateDuJour() {
  const aujourdhui = new Date();
  const jour = String(aujourdhui.getDate()).padStart(2, '0');
  const mois = String(aujourdhui.getMonth() + 1).padStart(2, '0');
  const annee = aujourdhui.getFullYear();
  return `${jour}/${mois}/${annee}`;
}

/**
 * Génère un DOCX à partir d'un modèle et de données.
 * @param {ArrayBuffer} modeleBuffer - Contenu binaire du fichier DOCX modèle
 * @param {Object} donnees - Données à injecter dans le modèle
 * @returns {Blob} Fichier DOCX généré
 */
function genererUnDocx(modeleBuffer, donnees) {
  /* global PizZip, docxtemplater */
  const zip = new PizZip(modeleBuffer);
  const doc = new docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '[', end: ']' },
  });

  doc.render(donnees);

  const contenuGenere = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return contenuGenere;
}

/**
 * Génère les attestations DOCX pour tous les licenciés et déclenche le téléchargement d'un ZIP.
 * @param {Object[]} licencies - Tableau des licenciés avec leurs données
 * @param {string} cheminModele - Chemin relatif vers le fichier DOCX modèle
 * @returns {Promise<void>}
 */
export async function genererAttestations(licencies, cheminModele) {
  // Charger les bibliothèques si nécessaire
  await chargerBibliotheques();

  // Charger le fichier modèle DOCX
  const reponseModele = await fetch(cheminModele);
  if (!reponseModele.ok) {
    throw new Error(`Impossible de charger le modèle : ${cheminModele}`);
  }
  const modeleBuffer = await reponseModele.arrayBuffer();

  /* global JSZip, saveAs */
  const zipFinal = new JSZip();
  const dateJour = obtenirDateDuJour();

  // Générer un DOCX par licencié
  licencies.forEach(licencie => {
    // Le modèle DOCX contient déjà le symbole '€' après la balise
    const montantTexte = licencie.montant != null ? `${licencie.montant}` : '';

    const donnees = {
      'PRENOM': licencie.prenom || '',
      'NOM': licencie.nom || '',
      'DATE DE NAISSANCE': licencie.dateNaissance || '',
      'ADRESSE COMPELETE': licencie.adresseComplete || '',
      'ADRESSE COMPLETE': licencie.adresseComplete || '',
      'MOTANT LICENSE': montantTexte,
      'MONTANT LICENSE': montantTexte,
      'MONTANT LICENCE': montantTexte,
      'DATE DU JOUR': dateJour,
    };

    const docxBlob = genererUnDocx(modeleBuffer, donnees);
    const nomNettoye = (licencie.nom || 'licencie')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_\-]/g, '_');
    const prenomNettoye = (licencie.prenom || '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_\-]/g, '_');

    const nomFichier = `attestation_${nomNettoye}_${prenomNettoye}.docx`;
    zipFinal.file(nomFichier, docxBlob);
  });

  // Générer et télécharger le ZIP
  const contenuZip = await zipFinal.generateAsync({ type: 'blob' });
  saveAs(contenuZip, 'attestations_paiement.zip');
}
