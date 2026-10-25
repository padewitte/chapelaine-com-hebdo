/**
 * Module principal de génération des attestations de paiement.
 * Coordonne la lecture CSV, le calcul des tarifs et la génération DOCX.
 */

import { parserCsvLicencies } from './csv-licencies-parser.js';
import { chargerTarifs, calculerTarif } from './calcul-tarif.js';
import { genererAttestations } from './generateur-docx.js';

let licenciesTraites = [];
let listeTarifs = [];

/**
 * Extrait l'année de naissance à partir d'une chaîne de date (ex: JJ/MM/AAAA ou AAAA-MM-JJ).
 * @param {string} dateStr - Date sous forme textuelle
 * @returns {number|null} Année sur 4 chiffres ou null
 */
function extraireAnneeNaissance(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Normalise le sexe en H ou F.
 * @param {string} sexeStr - Valeur brute du sexe
 * @returns {string} 'H' ou 'F'
 */
function normaliserSexe(sexeStr) {
  if (!sexeStr) return '';
  const s = sexeStr.trim().toUpperCase();
  if (s === 'H' || s === 'M' || s.startsWith('MASC')) return 'H';
  if (s === 'F' || s.startsWith('FEM')) return 'F';
  return s;
}

/**
 * Affiche le tableau d'aperçu des licenciés.
 * @param {Object[]} licencies - Liste des licenciés avec tarif calculé
 */
function afficherApercu(licencies) {
  const conteneur = document.getElementById('att-apercu');
  if (!conteneur) return;

  if (!licencies || licencies.length === 0) {
    conteneur.innerHTML = '<div class="empty-state">Aucun licencié trouvé dans le fichier.</div>';
    return;
  }

  const nbAvecTarif = licencies.filter(l => l.montant != null && l.montant > 0).length;

  let html = `
    <div class="att-resume">
      <strong>${licencies.length}</strong> licencié(s) chargé(s) —
      <strong>${nbAvecTarif}</strong> tarif(s) calculé(s) automatiquement.
    </div>
    <div class="att-table-wrapper">
      <table class="att-tableau">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Né(e) le</th>
            <th>Sexe</th>
            <th>Adresse complète</th>
            <th>Tarif licence (€)</th>
            <th>Paiement</th>
          </tr>
        </thead>
        <tbody>
  `;

  licencies.forEach((l, index) => {
    const montantValeur = l.montant != null ? l.montant : '';
    const statutPaiement = l.paiementEffectue || '—';

    html += `
      <tr>
        <td class="nom-gras">${l.nom || '—'}</td>
        <td>${l.prenom || '—'}</td>
        <td>${l.dateNaissance || '—'}</td>
        <td>${l.sexe || '—'}</td>
        <td class="col-adresse" title="${l.adresseComplete || ''}">${l.adresseComplete || '—'}</td>
        <td>
          <input type="number" class="att-input-tarif" data-index="${index}" value="${montantValeur}" placeholder="Tarif" style="width: 85px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--dark3); color: var(--text); font-weight: 700; text-align: right;"> €
        </td>
        <td>${statutPaiement}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  conteneur.innerHTML = html;

  // Écouter les modifications manuelles de tarifs
  conteneur.querySelectorAll('.att-input-tarif').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const val = parseFloat(e.target.value);
      licenciesTraites[idx].montant = isNaN(val) ? null : val;
    });
  });
}

/**
 * Traite le contenu d'un fichier CSV de licenciés.
 * @param {string} contenuCsv - Texte brut du CSV
 */
async function traiterFichierCsv(contenuCsv) {
  try {
    if (listeTarifs.length === 0) {
      listeTarifs = await chargerTarifs();
    }

    const licenciesBruts = parserCsvLicencies(contenuCsv);

    licenciesTraites = licenciesBruts.map(licencie => {
      const annee = extraireAnneeNaissance(licencie.dateNaissance);
      const sexe = normaliserSexe(licencie.sexe);
      const montant = annee ? calculerTarif(listeTarifs, annee, sexe) : null;

      return {
        ...licencie,
        sexeNormalise: sexe,
        anneeNaissance: annee,
        montant,
      };
    });

    afficherApercu(licenciesTraites);

    // Activer et pré-remplir le sélecteur de modèle
    const selectModele = document.getElementById('att-modele-select');
    if (selectModele) {
      selectModele.innerHTML = `
        <option value="ressources/modele-attestation-de-paiement/modele-attestation-de-paiement-chapelaine.docx">
          Modèle Chapelaine Handball (officiel)
        </option>
      `;
      selectModele.disabled = false;
    }

    // Activer le bouton de génération
    const btnGenerer = document.getElementById('att-btn-generer');
    if (btnGenerer) {
      btnGenerer.disabled = licenciesTraites.length === 0;
    }

  } catch (erreur) {
    console.error('Erreur lors du traitement du CSV :', erreur);
    const conteneur = document.getElementById('att-apercu');
    if (conteneur) {
      conteneur.innerHTML = `<div class="alert">⚠️ Erreur : ${erreur.message}</div>`;
    }
  }
}

/**
 * Initialise le module d'attestation de paiement.
 */
export function initialiserAttestation() {
  const dropzone = document.getElementById('att-dropzone');
  const fileInput = document.getElementById('att-file-input');
  const btnGenerer = document.getElementById('att-btn-generer');
  const selectModele = document.getElementById('att-modele-select');

  if (dropzone && fileInput) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const fichier = e.dataTransfer.files[0];
      if (fichier) {
        const lecteur = new FileReader();
        lecteur.onload = (evt) => traiterFichierCsv(evt.target.result);
        lecteur.readAsText(fichier, 'UTF-8');
      }
    });

    fileInput.addEventListener('change', (e) => {
      const fichier = e.target.files[0];
      if (fichier) {
        const lecteur = new FileReader();
        lecteur.onload = (evt) => traiterFichierCsv(evt.target.result);
        lecteur.readAsText(fichier, 'UTF-8');
      }
    });
  }

  // Pré-charger les tarifs dès le départ
  chargerTarifs().then(t => {
    listeTarifs = t;
  }).catch(err => {
    console.warn('Chargement initial des tarifs différé :', err);
  });

  // Gestion du clic sur le bouton "Générer les attestations"
  if (btnGenerer) {
    btnGenerer.addEventListener('click', async () => {
      if (!licenciesTraites || licenciesTraites.length === 0) return;

      const cheminModele = selectModele ? selectModele.value : 'ressources/modele-attestation-de-paiement/modele-attestation-de-paiement-chapelaine.docx';

      btnGenerer.disabled = true;
      const texteInitial = btnGenerer.textContent;
      btnGenerer.textContent = 'Génération en cours…';

      try {
        await genererAttestations(licenciesTraites, cheminModele);
        btnGenerer.textContent = '✓ Attestations téléchargées !';
        setTimeout(() => {
          btnGenerer.textContent = texteInitial;
          btnGenerer.disabled = false;
        }, 3000);
      } catch (erreur) {
        console.error('Erreur lors de la génération des attestations :', erreur);
        alert(`Erreur lors de la génération : ${erreur.message}`);
        btnGenerer.textContent = texteInitial;
        btnGenerer.disabled = false;
      }
    });
  }
}
