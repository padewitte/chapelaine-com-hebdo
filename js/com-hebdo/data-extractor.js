import { DataCleaner, estNotreClub } from './data-cleaner.js';

const store = {
  semaines: [],
  matchsParSemaine:        new Map(), // programme
  resultatsParSemaine:     new Map(), // résultats
  rencontresVues:          new Set(), // "code renc" déjà importés
};

// Notre équipe dans une poule = le club qui revient dans toutes ses rencontres
// (un export ne contient que les matchs d'un seul club). À égalité — poule d'un
// seul match — on tranche sur le nom du club.
function notreEquipeParPoule(lignes) {
  const compte = new Map();
  lignes.forEach(l => {
    const poule = l['num poule'];
    if (!poule) return;
    if (!compte.has(poule)) compte.set(poule, new Map());
    const c = compte.get(poule);
    [l['club rec'], l['club vis']].forEach(n => n && c.set(n, (c.get(n) || 0) + 1));
  });

  const nous = new Map();
  compte.forEach((c, poule) => {
    const [nom] = [...c].sort((a, b) => b[1] - a[1] || estNotreClub(b[0]) - estNotreClub(a[0]))[0] || [];
    if (estNotreClub(nom)) nous.set(poule, nom);
  });
  return nous;
}

export const DataExtractor = {

  addFichier({ type, lignes }) {
    const map = type === 'resultat'
      ? store.resultatsParSemaine
      : store.matchsParSemaine;

    const nous = notreEquipeParPoule(lignes);

    lignes.forEach(ligne => {
      const semaine = ligne['semaine'];
      if (!semaine) return;
      // Un derby est exporté par les deux clubs : on ne le garde qu'une fois.
      const renc = ligne['code renc'];
      if (renc) {
        if (store.rencontresVues.has(renc)) return;
        store.rencontresVues.add(renc);
      }
      ligne['_nous'] = nous.get(ligne['num poule']) || '';
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
    store.rencontresVues      = new Set();
  },

};
