/**
 * Calcul des tarifs de licence.
 * Charge le fichier tarifs.csv et recherche le tarif
 * correspondant à une année de naissance et un sexe.
 */

/**
 * Parse le contenu du fichier tarifs.csv.
 * @param {string} contenuTexte - Contenu brut du CSV
 * @returns {Object[]} Tableau de tarifs parsés
 */
function parserTarifsCsv(contenuTexte) {
  const lignes = contenuTexte.split('\n').filter(l => l.trim() !== '');
  if (lignes.length < 2) return [];

  return lignes.slice(1).map(ligne => {
    const [anneeNaissance, , categorie, tarif, sexeLettre] = ligne.split(';').map(v => v.trim());
    return {
      anneeNaissance: parseInt(anneeNaissance, 10),
      categorie,
      tarif: parseInt(tarif, 10),
      sexeLettre,
    };
  });
}

/**
 * Charge et parse le fichier tarifs.csv depuis les ressources.
 * @returns {Promise<Object[]>} Tableau de tarifs
 */
export async function chargerTarifs() {
  const reponse = await fetch('ressources/attestation-de-paiement/tarifs.csv');
  if (!reponse.ok) {
    throw new Error(`Impossible de charger tarifs.csv : ${reponse.status}`);
  }
  const contenu = await reponse.text();
  return parserTarifsCsv(contenu);
}

/**
 * Recherche le tarif correspondant à une année de naissance et un sexe.
 * Si l'année est antérieure à 2005, applique le tarif Senior correspondant (SM/SF).
 * @param {Object[]} tarifs - Tableau de tarifs chargés
 * @param {number} anneeNaissance - Année de naissance du licencié
 * @param {string} sexeLettre - Sexe du licencié (H ou F)
 * @returns {number|null} Montant du tarif ou null si non trouvé
 */
export function calculerTarif(tarifs, anneeNaissance, sexeLettre) {
  // Recherche exacte par année et sexe
  let correspondance = tarifs.find(
    t => t.anneeNaissance === anneeNaissance && t.sexeLettre === sexeLettre
  );

  // Si pas de correspondance exacte mais licencié adulte (né en 2005 ou avant)
  if (!correspondance && anneeNaissance <= 2005) {
    correspondance = tarifs.find(
      t => t.anneeNaissance === 2005 && t.sexeLettre === sexeLettre
    );
  }

  // Si pas de correspondance exacte mais tout petit (né après 2023)
  if (!correspondance && anneeNaissance >= 2023) {
    correspondance = tarifs.find(
      t => t.anneeNaissance === 2023 && t.sexeLettre === sexeLettre
    );
  }

  return correspondance ? correspondance.tarif : null;
}
