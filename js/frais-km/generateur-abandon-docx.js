/**
 * Génération du document Word (.docx) de déclaration de frais kilométriques
 * et d'abandon de frais au profit de La Chapelaine Handball (art. 200 du CGI).
 */

const CHEMIN_MODELE_ABANDON = 'ressources/frais-km/modele-abandon-frais-chapelaine.docx';

let libsDocxChargees = false;

/**
 * Charge un script JS depuis un CDN s'il n'est pas déjà présent.
 * @param {string} url
 * @returns {Promise<void>}
 */
function chargerScript(url) {
  return new Promise((resolve, reject) => {
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
 * Charge dynamiquement PizZip, Docxtemplater et FileSaver.
 * @returns {Promise<void>}
 */
async function chargerBibliothequesDocx() {
  if (libsDocxChargees && window.PizZip && window.docxtemplater && window.saveAs) return;

  const urls = [
    'https://cdn.jsdelivr.net/npm/pizzip@3/dist/pizzip.min.js',
    'https://cdn.jsdelivr.net/npm/docxtemplater@3/build/docxtemplater.min.js',
    'https://cdn.jsdelivr.net/npm/file-saver@2/dist/FileSaver.min.js',
  ];

  await chargerScript(urls[0]);
  await chargerScript(urls[1]);
  await chargerScript(urls[2]);

  libsDocxChargees = true;
}

/**
 * Formate la date du jour en JJ/MM/AAAA.
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
 * Formate un montant numérique en format monétaire français (ex: "127,20").
 * @param {number} montant
 * @returns {string}
 */
function formaterMontant(montant) {
  return (Number(montant) || 0).toFixed(2).replace('.', ',');
}

/**
 * Nettoie une chaîne pour un nom de fichier.
 * @param {string} texte
 * @returns {string}
 */
function nettoyerNomFichier(texte) {
  return (texte || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Génère et télécharge le document Word (.docx) d'abandon de frais kilométriques.
 * @param {Object} parametres
 * @returns {Promise<void>}
 */
export async function genererDocumentAbandonFrais(parametres) {
  await chargerBibliothequesDocx();

  const reponse = await fetch(CHEMIN_MODELE_ABANDON);
  if (!reponse.ok) {
    throw new Error(`Impossible de charger le modèle Word : ${CHEMIN_MODELE_ABANDON}`);
  }
  const modeleBuffer = await reponse.arrayBuffer();

  const donnees = {
    SAISON: '2026/2027',
    PRENOM: (parametres.prenom || '').trim(),
    NOM: (parametres.nom || '').trim().toUpperCase(),
    ADRESSE: (parametres.adresse || '').trim(),
    VEHICULE: parametres.libelleVehicule || '',
    IMMATRICULATION: (parametres.immatriculation || '').trim().toUpperCase() || 'Non renseignée',
    BAREME_FORMULE: parametres.formuleBareme || '',
    NB_DEPLACEMENTS: String(parametres.deplacements.length),
    TOTAL_KM: String(parametres.totalKm),
    MONTANT_TOTAL: formaterMontant(parametres.montantTotal),
    REDUCTION_IMPOT: formaterMontant(parametres.reductionImpot),
    DATE_DU_JOUR: obtenirDateDuJour(),
    DEPLACEMENTS: parametres.deplacements.map(d => ({
      DATE: d.dateStr,
      COLLECTIF: d.collectif,
      ADVERSAIRE: d.adversaire,
      LIEU: d.lieu,
      KM_AR: String(d.kmAr),
    })),
  };

  /* global PizZip, docxtemplater, saveAs */
  const zip = new PizZip(modeleBuffer);
  const doc = new docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '[', end: ']' },
  });

  doc.render(donnees);

  const blob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const nomClean = nettoyerNomFichier(parametres.nom || 'benevole');
  const prenomClean = nettoyerNomFichier(parametres.prenom || '');
  const suffixe = prenomClean ? `${nomClean}_${prenomClean}` : nomClean;
  saveAs(blob, `abandon_frais_km_${suffixe}.docx`);
}
