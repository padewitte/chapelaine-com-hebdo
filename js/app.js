/**
 * Point d'entrée principal de l'application Super Chapelaine.
 * Gère la navigation entre modules et initialise chaque fonctionnalité.
 */

import { initialiserAttestation } from './attestation/attestation-app.js';
import { initialiserComHebdo } from './com-hebdo/com-hebdo-app.js';

/**
 * Active un module spécifique et masque les autres.
 * @param {string} nomModule - Identifiant du module ('attestation', 'com-hebdo', 'frais-km', 'assistance')
 */
function activerModule(nomModule) {
  // Mettre à jour l'état actif des onglets principaux
  document.querySelectorAll('.menu-module').forEach(onglet => {
    onglet.classList.toggle('active', onglet.dataset.module === nomModule);
  });

  // Afficher le conteneur du module choisi, cacher les autres
  document.querySelectorAll('.module-content').forEach(conteneur => {
    conteneur.classList.toggle('hidden', conteneur.id !== `module-${nomModule}`);
  });
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  // Écouter les clics sur les onglets de modules
  document.querySelectorAll('.menu-module').forEach(onglet => {
    onglet.addEventListener('click', () => {
      activerModule(onglet.dataset.module);
    });
  });

  // Initialiser les modules actifs
  initialiserAttestation();
  initialiserComHebdo();
});
