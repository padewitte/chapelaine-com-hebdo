/**
 * Barème kilométrique officiel de l'administration fiscale française
 * applicable aux frais engagés par les bénévoles d'associations
 * (article 200 du CGI / BOFiP BOI-IR-RICI-250-20).
 */

export const TYPES_VEHICULES = [
  {
    id: 'voiture-3cv',
    categorie: 'Voiture',
    libelle: 'Voiture — 3 CV et moins',
    seuil1: 5000,
    seuil2: 20000,
    tranche1: { coef: 0.529, fixe: 0 },
    tranche2: { coef: 0.316, fixe: 1065 },
    tranche3: { coef: 0.370, fixe: 0 },
  },
  {
    id: 'voiture-4cv',
    categorie: 'Voiture',
    libelle: 'Voiture — 4 CV',
    seuil1: 5000,
    seuil2: 20000,
    tranche1: { coef: 0.606, fixe: 0 },
    tranche2: { coef: 0.340, fixe: 1330 },
    tranche3: { coef: 0.407, fixe: 0 },
  },
  {
    id: 'voiture-5cv',
    categorie: 'Voiture',
    libelle: 'Voiture — 5 CV',
    seuil1: 5000,
    seuil2: 20000,
    tranche1: { coef: 0.636, fixe: 0 },
    tranche2: { coef: 0.357, fixe: 1395 },
    tranche3: { coef: 0.427, fixe: 0 },
  },
  {
    id: 'voiture-6cv',
    categorie: 'Voiture',
    libelle: 'Voiture — 6 CV',
    seuil1: 5000,
    seuil2: 20000,
    tranche1: { coef: 0.665, fixe: 0 },
    tranche2: { coef: 0.374, fixe: 1457 },
    tranche3: { coef: 0.447, fixe: 0 },
  },
  {
    id: 'voiture-7cv',
    categorie: 'Voiture',
    libelle: 'Voiture — 7 CV et plus',
    seuil1: 5000,
    seuil2: 20000,
    tranche1: { coef: 0.697, fixe: 0 },
    tranche2: { coef: 0.394, fixe: 1515 },
    tranche3: { coef: 0.470, fixe: 0 },
  },
  {
    id: 'moto-1-2cv',
    categorie: 'Deux-roues',
    libelle: 'Moto (> 50 cm³) — 1 ou 2 CV',
    seuil1: 3000,
    seuil2: 6000,
    tranche1: { coef: 0.395, fixe: 0 },
    tranche2: { coef: 0.099, fixe: 891 },
    tranche3: { coef: 0.248, fixe: 0 },
  },
  {
    id: 'moto-3-5cv',
    categorie: 'Deux-roues',
    libelle: 'Moto (> 50 cm³) — 3, 4 ou 5 CV',
    seuil1: 3000,
    seuil2: 6000,
    tranche1: { coef: 0.468, fixe: 0 },
    tranche2: { coef: 0.082, fixe: 1158 },
    tranche3: { coef: 0.275, fixe: 0 },
  },
  {
    id: 'moto-5cv-plus',
    categorie: 'Deux-roues',
    libelle: 'Moto (> 50 cm³) — Plus de 5 CV',
    seuil1: 3000,
    seuil2: 6000,
    tranche1: { coef: 0.606, fixe: 0 },
    tranche2: { coef: 0.079, fixe: 1583 },
    tranche3: { coef: 0.343, fixe: 0 },
  },
  {
    id: 'cyclo-50',
    categorie: 'Deux-roues',
    libelle: 'Cyclomoteur (≤ 50 cm³)',
    seuil1: 3000,
    seuil2: 6000,
    tranche1: { coef: 0.315, fixe: 0 },
    tranche2: { coef: 0.079, fixe: 711 },
    tranche3: { coef: 0.198, fixe: 0 },
  },
];

export const TAUX_REDUCTION_IMPOT = 0.66;
export const MAJORATION_ELECTRIQUE = 1.20;

/**
 * Retourne la définition du barème pour un identifiant de véhicule donné.
 * @param {string} idVehicule
 * @returns {Object}
 */
export function obtenirVehicule(idVehicule) {
  return TYPES_VEHICULES.find(v => v.id === idVehicule) || TYPES_VEHICULES[2];
}

/**
 * Sélectionne la tranche du barème applicable selon la distance totale annuelle.
 * @param {Object} vehicule
 * @param {number} distanceTotaleKm
 * @returns {{ coef: number, fixe: number }}
 */
function obtenirTranche(vehicule, distanceTotaleKm) {
  if (distanceTotaleKm <= vehicule.seuil1) return vehicule.tranche1;
  if (distanceTotaleKm <= vehicule.seuil2) return vehicule.tranche2;
  return vehicule.tranche3;
}

/**
 * Calcule le montant total de l'abandon de frais et la réduction d'impôt estimée (66 %).
 * @param {number} distanceTotaleKm - Distance totale aller-retour en km
 * @param {string} idVehicule - Identifiant du type de véhicule
 * @param {boolean} estElectrique - Vrai si véhicule 100 % électrique (+20 %)
 * @returns {{ montantTotal: number, reductionImpot: number, formule: string, libelleVehicule: string }}
 */
export function calculerMontantBareme(distanceTotaleKm, idVehicule, estElectrique = false) {
  const d = Math.max(0, Number(distanceTotaleKm) || 0);
  const vehicule = obtenirVehicule(idVehicule);
  const tranche = obtenirTranche(vehicule, d);

  let montantBrut = d > 0 ? (d * tranche.coef) + tranche.fixe : 0;
  if (estElectrique) {
    montantBrut *= MAJORATION_ELECTRIQUE;
  }

  const montantTotal = Math.round(montantBrut * 100) / 100;
  const reductionImpot = Math.round(montantTotal * TAUX_REDUCTION_IMPOT * 100) / 100;

  const coefStr = tranche.coef.toFixed(3).replace('.', ',');
  let formule = tranche.fixe > 0
    ? `(d × ${coefStr} €) + ${tranche.fixe} €`
    : `d × ${coefStr} €/km`;

  if (estElectrique) {
    formule += ' (+20 % électrique)';
  }

  const libelleVehicule = estElectrique
    ? `${vehicule.libelle} (100 % électrique)`
    : `${vehicule.libelle} (thermique / hybride)`;

  return {
    montantTotal,
    reductionImpot,
    formule,
    libelleVehicule,
    coefUnitaire: estElectrique ? tranche.coef * MAJORATION_ELECTRIQUE : tranche.coef,
  };
}
