/**
 * Module Frais kilométriques & Abandon de frais (article 200 du CGI).
 * Permet de sélectionner ses collectifs, de cocher les déplacements passés
 * à l'extérieur, de calculer les distances depuis l'adresse de départ
 * (La Coutancière par défaut) selon le barème officiel de l'État, et de
 * télécharger la déclaration Word (.docx) avec l'en-tête officielle du club.
 */

import { CsvParser } from '../com-hebdo/csv-parser.js';
import { DataCleaner, estNotreClub, estNotreEquipe } from '../com-hebdo/data-cleaner.js';
import { nomPoule } from '../com-hebdo/competitions.js';
import { TYPES_VEHICULES, calculerMontantBareme } from './bareme-etat.js';
import {
  ADRESSE_COUTANCIERE_DEFAUT,
  COORD_COUTANCIERE,
  calculerDistanceRoutiereArKm,
  resoudreDestinationMatch,
  geocoderAdresse,
} from './distances-clubs.js';
import { genererDocumentAbandonFrais } from './generateur-abandon-docx.js';

const FICHIERS_CSV_DEFAUT = [
  'assets/csv/2026-11-23_export-0.csv',
  'assets/csv/2026-11-23_export-1.csv',
  'assets/csv/2026-11-23_export-2.csv',
  'assets/csv/2026-11-23_export-3.csv',
  'assets/csv/2026-11-23_export-4.csv',
  'assets/csv/2026-11-23_export-5.csv',
];

const etat = {
  deplacements: [],           // Tous les matchs passés à l'extérieur
  collectifsDisponibles: [],  // Liste triée des collectifs ayant des déplacements
  collectifsSelectionnes: new Set(),
  coordDepart: { ...COORD_COUTANCIERE },
  adresseDepart: ADRESSE_COUTANCIERE_DEFAUT,
};

/**
 * Compare deux noms de collectifs par catégorie d'âge croissante (U11 -> U19 -> SF/SM).
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function comparerCollectifs(a, b) {
  const rang = nom => {
    const p = (nom || '').trim().toUpperCase();
    const matchJeune = p.match(/^U(\d+)/);
    if (matchJeune) return parseInt(matchJeune[1], 10);
    if (p.startsWith('SF') || p.startsWith('SM')) return 100;
    return 200;
  };
  const diff = rang(a) - rang(b);
  if (diff !== 0) return diff;
  return (a || '').localeCompare(b || '', 'fr', { numeric: true });
}

/**
 * Convertit une date "JJ/MM/AAAA" en objet Date à 00:00:00 (ou null si invalide).
 * @param {string} dateStr
 * @returns {Date|null}
 */
function parserDateFr(dateStr) {
  const propre = (dateStr || '').trim();
  if (!propre) return null;
  const morceaux = propre.split('/');
  if (morceaux.length !== 3) return null;
  const [jour, mois, annee] = morceaux.map(Number);
  if (!jour || !mois || !annee) return null;
  const d = new Date(annee, mois - 1, jour);
  d.setHours(0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Identifie notre équipe dominante par poule sur un ensemble de lignes CSV.
 * @param {Object[]} lignes
 * @returns {Map<string, { nom: string, num: string }>}
 */
function notreEquipeParPoule(lignes) {
  const compte = new Map();
  lignes.forEach(l => {
    const poule = l['num poule'];
    if (!poule) return;
    if (!compte.has(poule)) compte.set(poule, new Map());
    const c = compte.get(poule);
    [
      { nom: l['club rec'], num: l['Num rec'] || '' },
      { nom: l['club vis'], num: l['Num vis'] || '' },
    ].forEach(({ nom, num }) => {
      if (!nom) return;
      const existant = c.get(nom) || { count: 0, num };
      existant.count += 1;
      if (!existant.num && num) existant.num = num;
      c.set(nom, existant);
    });
  });

  const nous = new Map();
  compte.forEach((c, poule) => {
    const [nom, info] = [...c].sort((a, b) =>
      b[1].count - a[1].count
      || Number(estNotreEquipe(b[0], b[1].num)) - Number(estNotreEquipe(a[0], a[1].num))
    )[0] || [];
    if (nom && estNotreEquipe(nom, info?.num)) {
      nous.set(poule, { nom, num: info.num || '' });
    }
  });
  return nous;
}

/**
 * Extrait et fusionne tous les déplacements passés à l'extérieur depuis une liste de lots de lignes CSV.
 * @param {Object[][]} lotsLignes
 */
function extraireDeplacementsPassesExterieur(lotsLignes) {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  // 1. Collecter les salles et communes connues dans les CSV Programme
  const sallesParRenc = new Map();
  const sallesParClub = new Map();

  lotsLignes.forEach(lignes => {
    lignes.forEach(l => {
      const ville = (l['Ville'] || '').trim();
      const cp = (l['CP'] || '').trim();
      const salle = (l['nom salle'] || '').trim();
      const codeRenc = (l['code renc'] || '').trim();
      const numRec = (l['Num rec'] || '').trim();

      if (ville || salle) {
        const info = { ville, cp, salle };
        if (codeRenc) sallesParRenc.set(codeRenc, info);
        if (numRec && !sallesParClub.has(numRec)) sallesParClub.set(numRec, info);
      }
    });
  });

  // 2. Parcourir les lignes pour retenir uniquement les matchs à l'extérieur dans le passé
  const rencontresVues = new Set();
  const tournoisVus = new Set();
  const deplacements = [];

  lotsLignes.forEach(lignesBrutes => {
    const lignes = lignesBrutes.filter(l =>
      estNotreEquipe(l['club rec'], l['Num rec'])
      || estNotreEquipe(l['club vis'], l['Num vis'])
      || estNotreClub(l['club hote'])
    );
    const nousParPoule = notreEquipeParPoule(lignes);

    lignes.forEach(l => {
      const dateStr = (l['le'] || '').trim();
      const dateObj = parserDateFr(dateStr);
      if (!dateObj || dateObj >= aujourdhui) return;

      const rec = (l['club rec'] || '').trim();
      const vis = (l['club vis'] || '').trim();
      const numRec = (l['Num rec'] || '').trim();
      const numVis = (l['Num vis'] || '').trim();
      if (!rec && !vis) return;

      // Identifier si le match est à domicile ou à l'extérieur
      const estDomicile = DataCleaner.isMatchDom(l);
      if (estDomicile) return;
      // En fichier Résultats sans "club hote", vérifier aussi que le recevant n'est pas notre équipe
      if (estNotreEquipe(rec, numRec)) return;

      const codeRenc = (l['code renc'] || '').trim();
      if (codeRenc) {
        if (rencontresVues.has(codeRenc)) return;
        rencontresVues.add(codeRenc);
      }

      // Identifier notre équipe et le collectif
      const recEstNous = estNotreEquipe(rec, numRec);
      const visEstNous = estNotreEquipe(vis, numVis);
      const notreEq = (visEstNous && !recEstNous)
        ? { nom: vis, num: numVis }
        : (recEstNous && !visEstNous)
          ? { nom: rec, num: numRec }
          : (nousParPoule.get(l['num poule']) || { nom: vis, num: numVis });

      const collectif = nomPoule(
        l['num poule'],
        l['poule'],
        notreEq.nom,
        l['competition'],
        notreEq.num
      );
      if (!collectif) return;

      const estTournoi = DataCleaner.isTournoi(collectif, l['poule']);
      if (estTournoi) {
        const cleTournoi = `${collectif}::${dateStr}::${l['num poule']}`;
        if (tournoisVus.has(cleTournoi)) return;
        tournoisVus.add(cleTournoi);
      }

      const adversaire = estTournoi
        ? `Tournoi (${DataCleaner.cleanNomEquipe(rec)})`
        : DataCleaner.cleanNomEquipe(rec);

      const infoCsv = sallesParRenc.get(codeRenc) || sallesParClub.get(numRec) || {};
      const dest = resoudreDestinationMatch({
        numRec,
        clubRec: rec,
        adversaire,
        villeCsv: (l['Ville'] || infoCsv.ville || '').trim(),
        cpCsv: (l['CP'] || infoCsv.cp || '').trim(),
        salleCsv: (l['nom salle'] || infoCsv.salle || '').trim(),
      });

      const dateISO = DataCleaner.toISO(dateStr);
      const kmAr = calculerDistanceRoutiereArKm(etat.coordDepart, dest.coord);

      deplacements.push({
        id: codeRenc || `${dateISO}-${collectif}-${numRec}`,
        dateStr,
        dateISO,
        horaire: DataCleaner.formatHeure(l['horaire']),
        collectif,
        adversaire,
        lieu: dest.lieu,
        coord: dest.coord,
        kmAr,
        kmPersonnalise: false,
        coche: false,
      });
    });
  });

  // Trier par date croissante puis par collectif
  deplacements.sort((a, b) =>
    a.dateISO.localeCompare(b.dateISO)
    || comparerCollectifs(a.collectif, b.collectif)
  );

  etat.deplacements = deplacements;

  const setCollectifs = new Set(deplacements.map(d => d.collectif));
  etat.collectifsDisponibles = [...setCollectifs].sort(comparerCollectifs);

  // Conserver les collectifs sélectionnés s'ils existent toujours
  etat.collectifsSelectionnes.forEach(c => {
    if (!setCollectifs.has(c)) etat.collectifsSelectionnes.delete(c);
  });
}

/**
 * Retourne les déplacements correspondant aux collectifs actuellement sélectionnés.
 * @returns {Object[]}
 */
function obtenirDeplacementsFiltres() {
  if (etat.collectifsSelectionnes.size === 0) return [];
  return etat.deplacements.filter(d => etat.collectifsSelectionnes.has(d.collectif));
}

/**
 * Retourne les déplacements cochés parmi ceux des collectifs sélectionnés.
 * @returns {Object[]}
 */
function obtenirDeplacementsCoches() {
  return obtenirDeplacementsFiltres().filter(d => d.coche);
}

/**
 * Formate un nombre en euros (ex: "127,20 €").
 * @param {number} valeur
 * @returns {string}
 */
function formaterEuros(valeur) {
  return `${(Number(valeur) || 0).toFixed(2).replace('.', ',')} €`;
}

/**
 * Affiche les puces de sélection des collectifs.
 */
function afficherPucesCollectifs() {
  const conteneur = document.getElementById('fkm-collectifs-pills');
  if (!conteneur) return;

  if (etat.collectifsDisponibles.length === 0) {
    conteneur.innerHTML = '<div class="empty-state">Aucun match passé à l\'extérieur trouvé dans les fichiers CSV.</div>';
    return;
  }

  const compteParCollectif = new Map();
  etat.deplacements.forEach(d => {
    compteParCollectif.set(d.collectif, (compteParCollectif.get(d.collectif) || 0) + 1);
  });

  conteneur.innerHTML = etat.collectifsDisponibles.map(col => {
    const actif = etat.collectifsSelectionnes.has(col) ? 'active' : '';
    const nb = compteParCollectif.get(col) || 0;
    return `
      <button type="button" class="fkm-pill ${actif}" data-collectif="${col}">
        <span>${col}</span>
        <span class="fkm-pill-count">${nb}</span>
      </button>
    `;
  }).join('');

  conteneur.querySelectorAll('.fkm-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.dataset.collectif;
      if (etat.collectifsSelectionnes.has(col)) {
        etat.collectifsSelectionnes.delete(col);
      } else {
        etat.collectifsSelectionnes.add(col);
      }
      afficherPucesCollectifs();
      afficherTableauDeplacements();
      mettreAJourRecapitulatif();
    });
  });
}

/**
 * Affiche le tableau des matchs à l'extérieur et dans le passé pour les collectifs sélectionnés.
 */
function afficherTableauDeplacements() {
  const conteneur = document.getElementById('fkm-matchs-conteneur');
  if (!conteneur) return;

  const filtres = obtenirDeplacementsFiltres();

  if (etat.collectifsSelectionnes.size === 0) {
    conteneur.innerHTML = '<div class="empty-state">Sélectionnez un ou plusieurs collectifs ci-dessus pour afficher leurs matchs passés à l\'extérieur.</div>';
    return;
  }

  if (filtres.length === 0) {
    conteneur.innerHTML = '<div class="empty-state">Aucun match à l\'extérieur passé pour cette sélection.</div>';
    return;
  }

  const selectVehicule = document.getElementById('fkm-vehicule-select');
  const checkElec = document.getElementById('fkm-electrique');
  const idVehicule = selectVehicule?.value || 'voiture-5cv';
  const estElectrique = Boolean(checkElec?.checked);
  const { coefUnitaire } = calculerMontantBareme(100, idVehicule, estElectrique);

  const lignesHtml = filtres.map(d => {
    const montantLigne = formaterEuros(d.kmAr * coefUnitaire);
    return `
      <tr class="${d.coche ? 'fkm-row-selected' : ''}" data-id="${d.id}">
        <td>
          <input type="checkbox" class="fkm-check-match" data-id="${d.id}" ${d.coche ? 'checked' : ''}>
        </td>
        <td><strong>${d.dateStr}</strong>${d.horaire ? ` <span class="team-away">(${d.horaire})</span>` : ''}</td>
        <td><span class="team-home">${d.collectif}</span></td>
        <td>${d.adversaire}</td>
        <td><span class="team-away">${d.lieu}</span></td>
        <td>
          <input type="number" class="fkm-input-km" data-id="${d.id}" value="${d.kmAr}" min="1" max="2000" step="1"> km
        </td>
        <td class="fkm-col-montant" data-id="${d.id}"><strong>${montantLigne}</strong></td>
      </tr>
    `;
  }).join('');

  conteneur.innerHTML = `
    <div class="fkm-table-wrap">
      <table class="fkm-table">
        <thead>
          <tr>
            <th>Part.</th>
            <th>Date</th>
            <th>Collectif</th>
            <th>Adversaire</th>
            <th>Lieu / Gymnase</th>
            <th>Distance A/R</th>
            <th>Évaluation</th>
          </tr>
        </thead>
        <tbody>${lignesHtml}</tbody>
      </table>
    </div>
  `;

  // Écouteurs sur les cases à cocher
  conteneur.querySelectorAll('.fkm-check-match').forEach(chk => {
    chk.addEventListener('change', e => {
      const id = e.target.dataset.id;
      const dep = etat.deplacements.find(x => x.id === id);
      if (dep) {
        dep.coche = e.target.checked;
        const tr = e.target.closest('tr');
        if (tr) tr.classList.toggle('fkm-row-selected', dep.coche);
        mettreAJourRecapitulatif();
      }
    });
  });

  // Clic sur la ligne entière (hors champ numérique et checkbox) pour cocher/décocher
  conteneur.querySelectorAll('tbody tr').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.tagName === 'INPUT') return;
      const chk = tr.querySelector('.fkm-check-match');
      if (chk) {
        chk.checked = !chk.checked;
        chk.dispatchEvent(new Event('change'));
      }
    });
  });

  // Écouteurs sur la modification manuelle des kilomètres A/R
  conteneur.querySelectorAll('.fkm-input-km').forEach(inp => {
    inp.addEventListener('input', e => {
      const id = e.target.dataset.id;
      const val = Math.max(0, parseInt(e.target.value, 10) || 0);
      const dep = etat.deplacements.find(x => x.id === id);
      if (dep) {
        dep.kmAr = val;
        dep.kmPersonnalise = true;
        const cellMontant = conteneur.querySelector(`.fkm-col-montant[data-id="${id}"]`);
        if (cellMontant) {
          const { coefUnitaire: coef } = calculerMontantBareme(
            100,
            document.getElementById('fkm-vehicule-select')?.value || 'voiture-5cv',
            Boolean(document.getElementById('fkm-electrique')?.checked)
          );
          cellMontant.innerHTML = `<strong>${formaterEuros(val * coef)}</strong>`;
        }
        mettreAJourRecapitulatif();
      }
    });
  });
}

/**
 * Met à jour les compteurs, le calcul au barème officiel de l'État et l'état du bouton Word.
 */
function mettreAJourRecapitulatif() {
  const coches = obtenirDeplacementsCoches();
  const totalKm = coches.reduce((acc, d) => acc + (Number(d.kmAr) || 0), 0);

  const selectVehicule = document.getElementById('fkm-vehicule-select');
  const checkElec = document.getElementById('fkm-electrique');
  const idVehicule = selectVehicule?.value || 'voiture-5cv';
  const estElectrique = Boolean(checkElec?.checked);

  const resultat = calculerMontantBareme(totalKm, idVehicule, estElectrique);

  const elNb = document.getElementById('fkm-recap-nb');
  const elKm = document.getElementById('fkm-recap-km');
  const elFormule = document.getElementById('fkm-recap-formule');
  const elMontant = document.getElementById('fkm-recap-montant');
  const elImpot = document.getElementById('fkm-recap-impot');

  if (elNb) elNb.textContent = String(coches.length);
  if (elKm) elKm.textContent = `${totalKm} km`;
  if (elFormule) elFormule.textContent = resultat.formule;
  if (elMontant) elMontant.textContent = formaterEuros(resultat.montantTotal);
  if (elImpot) elImpot.textContent = formaterEuros(resultat.reductionImpot);

  const nom = (document.getElementById('fkm-nom')?.value || '').trim();
  const prenom = (document.getElementById('fkm-prenom')?.value || '').trim();
  const immat = (document.getElementById('fkm-immatriculation')?.value || '').trim();
  const adresse = (document.getElementById('fkm-adresse')?.value || '').trim();

  const btnGenerer = document.getElementById('fkm-btn-generer-docx');
  const msgValidation = document.getElementById('fkm-validation-msg');

  const manquants = [];
  if (!nom) manquants.push('Nom');
  if (!prenom) manquants.push('Prénom');
  if (!immat) manquants.push('Immatriculation');
  if (!adresse) manquants.push('Adresse');
  if (coches.length === 0) manquants.push('au moins 1 déplacement coché');

  if (btnGenerer) {
    btnGenerer.disabled = manquants.length > 0;
  }

  if (msgValidation) {
    if (manquants.length > 0) {
      msgValidation.textContent = `Pour générer le document Word, complétez : ${manquants.join(', ')}.`;
    } else {
      msgValidation.textContent = `Prêt à générer la déclaration officielle d'abandon de frais (${coches.length} déplacement(s), ${totalKm} km, ${formaterEuros(resultat.montantTotal)}).`;
    }
  }
}

/**
 * Recalcule toutes les distances A/R à partir d'une nouvelle adresse de départ.
 */
async function recalculerDistancesDepuisAdresse() {
  const inputAdresse = document.getElementById('fkm-adresse');
  const statutAdresse = document.getElementById('fkm-adresse-statut');
  const btnRecalculer = document.getElementById('fkm-btn-recalculer-adresse');

  const texte = (inputAdresse?.value || '').trim() || ADRESSE_COUTANCIERE_DEFAUT;
  if (btnRecalculer) {
    btnRecalculer.disabled = true;
    btnRecalculer.textContent = 'Calcul…';
  }

  const geo = await geocoderAdresse(texte);
  etat.coordDepart = { lat: geo.lat, lon: geo.lon };
  etat.adresseDepart = texte;

  etat.deplacements.forEach(d => {
    d.kmAr = calculerDistanceRoutiereArKm(etat.coordDepart, d.coord);
    d.kmPersonnalise = false;
  });

  if (statutAdresse) {
    statutAdresse.textContent = `Point de départ actif : ${geo.label}`;
  }
  if (btnRecalculer) {
    btnRecalculer.disabled = false;
    btnRecalculer.textContent = 'Recalculer les km';
  }

  afficherTableauDeplacements();
  mettreAJourRecapitulatif();
}

/**
 * Charge par défaut les fichiers CSV présents dans assets/csv/.
 */
async function chargerCsvParDefaut() {
  const statutCsv = document.getElementById('fkm-statut-csv');
  try {
    const reponses = await Promise.all(
      FICHIERS_CSV_DEFAUT.map(url =>
        fetch(url).then(r => (r.ok ? r.text() : '')).catch(() => '')
      )
    );
    const lots = reponses
      .filter(Boolean)
      .map(texte => CsvParser.parse(texte))
      .filter(lignes => lignes.length > 0);

    extraireDeplacementsPassesExterieur(lots);
    afficherPucesCollectifs();
    afficherTableauDeplacements();
    mettreAJourRecapitulatif();

    if (statutCsv) {
      statutCsv.textContent = `✓ ${etat.deplacements.length} matchs passés à l'extérieur chargés (${etat.collectifsDisponibles.length} collectifs).`;
    }
  } catch (err) {
    console.warn('Impossible de pré-charger les CSV par défaut :', err);
    if (statutCsv) {
      statutCsv.textContent = 'Importez vos fichiers CSV GestHand ci-dessous.';
    }
  }
}

/**
 * Traite une liste de fichiers CSV importés par l'utilisateur.
 * @param {FileList} files
 */
function traiterFichiersImportes(files) {
  const valides = Array.from(files || []).filter(f =>
    f.type === 'text/csv' || f.name.endsWith('.csv') || f.name.endsWith('.txt')
  );
  if (valides.length === 0) return;

  const lectures = valides.map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(CsvParser.parse(e.target.result));
    reader.readAsText(file, 'UTF-8');
  }));

  Promise.all(lectures).then(lots => {
    extraireDeplacementsPassesExterieur(lots);
    afficherPucesCollectifs();
    afficherTableauDeplacements();
    mettreAJourRecapitulatif();

    const statutCsv = document.getElementById('fkm-statut-csv');
    if (statutCsv) {
      statutCsv.textContent = `✓ ${etat.deplacements.length} matchs passés à l'extérieur chargés depuis ${valides.length} fichier(s).`;
    }
  });
}

/**
 * Initialise le module Frais kilométriques & Abandon de frais.
 */
export function initialiserFraisKm() {
  const selectVehicule = document.getElementById('fkm-vehicule-select');
  if (!selectVehicule) return;

  // 1. Peupler le sélecteur de véhicules avec le barème officiel de l'État
  selectVehicule.innerHTML = TYPES_VEHICULES.map(v => {
    const coefStr = v.tranche1.coef.toFixed(3).replace('.', ',');
    const selected = v.id === 'voiture-5cv' ? 'selected' : '';
    return `<option value="${v.id}" ${selected}>${v.libelle} (${coefStr} €/km)</option>`;
  }).join('');

  // 2. Écouteurs de formulaire
  ['fkm-nom', 'fkm-prenom', 'fkm-immatriculation', 'fkm-adresse'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', mettreAJourRecapitulatif);
  });

  selectVehicule.addEventListener('change', () => {
    afficherTableauDeplacements();
    mettreAJourRecapitulatif();
  });

  document.getElementById('fkm-electrique')?.addEventListener('change', () => {
    afficherTableauDeplacements();
    mettreAJourRecapitulatif();
  });

  // 3. Adresse de départ & recalcul des distances
  document.getElementById('fkm-btn-recalculer-adresse')?.addEventListener('click', () => {
    recalculerDistancesDepuisAdresse();
  });

  document.getElementById('fkm-btn-reset-adresse')?.addEventListener('click', () => {
    const inputAdresse = document.getElementById('fkm-adresse');
    if (inputAdresse) inputAdresse.value = ADRESSE_COUTANCIERE_DEFAUT;
    recalculerDistancesDepuisAdresse();
  });

  // 4. Boutons de sélection rapide des collectifs
  document.getElementById('fkm-btn-tous-collectifs')?.addEventListener('click', () => {
    etat.collectifsDisponibles.forEach(c => etat.collectifsSelectionnes.add(c));
    afficherPucesCollectifs();
    afficherTableauDeplacements();
    mettreAJourRecapitulatif();
  });

  document.getElementById('fkm-btn-aucun-collectif')?.addEventListener('click', () => {
    etat.collectifsSelectionnes.clear();
    afficherPucesCollectifs();
    afficherTableauDeplacements();
    mettreAJourRecapitulatif();
  });

  // 5. Boutons Tout cocher / Tout décocher sur les matchs affichés
  document.getElementById('fkm-btn-tout-cocher')?.addEventListener('click', () => {
    obtenirDeplacementsFiltres().forEach(d => { d.coche = true; });
    afficherTableauDeplacements();
    mettreAJourRecapitulatif();
  });

  document.getElementById('fkm-btn-tout-decocher')?.addEventListener('click', () => {
    obtenirDeplacementsFiltres().forEach(d => { d.coche = false; });
    afficherTableauDeplacements();
    mettreAJourRecapitulatif();
  });

  // 6. Import CSV dans Frais km (et synchronisation avec l'import de Com Hebdo)
  const dropzone = document.getElementById('fkm-dropzone');
  const fileInput = document.getElementById('fkm-file-input');

  if (dropzone && fileInput) {
    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      traiterFichiersImportes(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', e => {
      traiterFichiersImportes(e.target.files);
    });
  }

  document.getElementById('com-hebdo-file-input')?.addEventListener('change', e => {
    traiterFichiersImportes(e.target.files);
  });

  // 7. Bouton de génération du document Word (.docx)
  const btnGenerer = document.getElementById('fkm-btn-generer-docx');
  if (btnGenerer) {
    btnGenerer.addEventListener('click', async () => {
      const coches = obtenirDeplacementsCoches();
      if (coches.length === 0) return;

      const nom = (document.getElementById('fkm-nom')?.value || '').trim();
      const prenom = (document.getElementById('fkm-prenom')?.value || '').trim();
      const immatriculation = (document.getElementById('fkm-immatriculation')?.value || '').trim();
      const adresse = (document.getElementById('fkm-adresse')?.value || '').trim() || ADRESSE_COUTANCIERE_DEFAUT;
      const idVehicule = selectVehicule.value || 'voiture-5cv';
      const estElectrique = Boolean(document.getElementById('fkm-electrique')?.checked);

      const totalKm = coches.reduce((acc, d) => acc + (Number(d.kmAr) || 0), 0);
      const calcul = calculerMontantBareme(totalKm, idVehicule, estElectrique);

      const texteInitial = btnGenerer.textContent;
      btnGenerer.disabled = true;
      btnGenerer.textContent = 'Génération du Word en cours…';

      try {
        await genererDocumentAbandonFrais({
          nom,
          prenom,
          immatriculation,
          adresse,
          libelleVehicule: calcul.libelleVehicule,
          formuleBareme: calcul.formule,
          deplacements: coches,
          totalKm,
          montantTotal: calcul.montantTotal,
          reductionImpot: calcul.reductionImpot,
        });
        btnGenerer.textContent = '✓ Document Word téléchargé !';
        setTimeout(() => {
          btnGenerer.textContent = texteInitial;
          mettreAJourRecapitulatif();
        }, 3000);
      } catch (err) {
        console.error('Erreur lors de la génération du document Word :', err);
        alert(`Erreur lors de la génération : ${err.message}`);
        btnGenerer.textContent = texteInitial;
        mettreAJourRecapitulatif();
      }
    });
  }

  // 8. Charger automatiquement les CSV par défaut au démarrage
  chargerCsvParDefaut();
}
