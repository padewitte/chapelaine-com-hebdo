import { DataCleaner } from './data-cleaner.js';

const store = {
  semaines: [],
  matchsParSemaine:        new Map(), // programme
  resultatsParSemaine:     new Map(), // résultats
};

export const DataExtractor = {

  addFichier({ type, lignes }) {
    const map = type === 'resultat'
      ? store.resultatsParSemaine
      : store.matchsParSemaine;

    lignes.forEach(ligne => {
      const semaine = ligne['semaine'];
      if (!semaine) return;
      if (!map.has(semaine)) map.set(semaine, []);
      map.get(semaine).push(ligne);
    });

    const toutes = new Set([
      ...store.semaines,
      ...store.matchsParSemaine.keys(),
      ...store.resultatsParSemaine.keys(),
    ]);
    store.semaines = [...toutes].sort();
  },

  getMatchsParSemaine(semaine) {
    return (store.matchsParSemaine.get(semaine) || [])
      .map(l => DataCleaner.nettoyer(l))
      .filter(Boolean);
  },

  getResultatsParSemaine(semaine) {
    return (store.resultatsParSemaine.get(semaine) || [])
      .map(l => DataCleaner.nettoyerResultat(l))
      .filter(Boolean);
  },

  getSemaines() {
    return store.semaines;
  },

  reset() {
    store.semaines            = [];
    store.matchsParSemaine    = new Map();
    store.resultatsParSemaine = new Map();
  },

};
