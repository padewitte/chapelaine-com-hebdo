import { DataCleaner, estNotreClub, estNotreEquipe } from './data-cleaner.js';

const store = {
  semaines: [],
  matchsParSemaine:        new Map(), // programme
  resultatsParSemaine:     new Map(), // résultats
  rencontresVues:          new Set(), // "code renc" déjà importés
};

// Notre équipe dans une poule = le club qui revient dans toutes ses rencontres
// (un export ne contient que les matchs d'un seul club). À égalité — poule d'un
// seul match — on tranche sur l'appartenance au club.
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

// Identifie notre équipe pour une rencontre donnée, avec repli sur l'équipe
// dominante de la poule (derby ou match tiers hébergé en triangulaire).
function identifierNotreEquipe(ligne, nousParPoule) {
  const recEstNous = estNotreEquipe(ligne['club rec'], ligne['Num rec']);
  const visEstNous = estNotreEquipe(ligne['club vis'], ligne['Num vis']);

  if (recEstNous && !visEstNous) {
    return { nom: ligne['club rec'] || '', num: ligne['Num rec'] || '' };
  }
  if (visEstNous && !recEstNous) {
    return { nom: ligne['club vis'] || '', num: ligne['Num vis'] || '' };
  }
  return nousParPoule.get(ligne['num poule']) || { nom: '', num: '' };
}

// Retourne la date du samedi (à 00:00:00) pour une semaine ISO "YYYY-SS".
function getSamediSemaine(semaineStr) {
  const [annee, semaine] = semaineStr.split('-').map(Number);
  const date = new Date(annee, 0, 4);
  date.setHours(0, 0, 0, 0);
  const jourIso = date.getDay() || 7;
  date.setDate(date.getDate() - (jourIso - 1) + (semaine - 1) * 7 + 5);
  return date;
}

export const DataExtractor = {

  addFichier({ type, lignes }) {
    const map = type === 'resultat'
      ? store.resultatsParSemaine
      : store.matchsParSemaine;

    // L'export d'un club partenaire (ex. HBC Gesvres) contient aussi ses propres
    // équipes : on ne garde que les rencontres où l'une de nos équipes apparaît.
    lignes = lignes.filter(l =>
      estNotreEquipe(l['club rec'], l['Num rec'])
      || estNotreEquipe(l['club vis'], l['Num vis'])
      || estNotreClub(l['club hote']));

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
      const equipe = identifierNotreEquipe(ligne, nous);
      ligne['_nous']    = equipe.nom;
      ligne['_numNous'] = equipe.num;
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

  // Retourne les matchs à domicile non conclus des semaines à venir par rapport
  // à la date du jour, en regroupant les triangulaires sur une seule ligne.
  getMatchsDomicileNonConclus(dateRef = new Date()) {
    const aujourdhui = new Date(dateRef);
    aujourdhui.setHours(0, 0, 0, 0);

    const samediCourant = new Date(aujourdhui);
    const jourIso = samediCourant.getDay() || 7;
    samediCourant.setDate(samediCourant.getDate() + (6 - jourIso));

    const resultats = [];

    store.semaines.forEach(semaine => {
      const samediMatch = getSamediSemaine(semaine);
      if (samediMatch < aujourdhui) return;

      const delaiSemaines = Math.round((samediMatch - samediCourant) / (7 * 24 * 3600 * 1000));
      const lignes = store.matchsParSemaine.get(semaine) || [];
      const analyses = lignes
        .map(l => DataCleaner.analyserNonConclu(l))
        .filter(Boolean);

      if (analyses.length === 0) return;

      const groupes = new Map();
      analyses.forEach(a => {
        const cle = a.numPoule || a.codeRenc;
        if (!groupes.has(cle)) groupes.set(cle, []);
        groupes.get(cle).push(a);
      });

      const matchsSemaine = [];
      groupes.forEach(elements => {
        const premier         = elements[0];
        const estTriangulaire = elements.length > 1;
        let adversaire        = premier.adversaire;

        if (estTriangulaire) {
          const adversairesUniques = [...new Set(elements.flatMap(e => e.clubsAdverses))];
          adversaire = adversairesUniques.length > 0
            ? `${adversairesUniques.join(' / ')} (Triangulaire)`
            : `${premier.adversaire} (Triangulaire)`;
        }

        const setManquants = new Set(elements.flatMap(e => e.manquants));
        const manquants = ['Date', 'Horaire', 'Salle'].filter(m => setManquants.has(m));

        matchsSemaine.push({
          semaine,
          samediDate: samediMatch,
          delaiSemaines,
          urgent: delaiSemaines <= 6,
          poule: premier.poule,
          adversaire,
          manquants,
          estTriangulaire,
          nbRencontres: elements.length,
        });
      });

      matchsSemaine.sort((a, b) =>
        (a.poule || '').localeCompare(b.poule || '', 'fr', { numeric: true })
      );
      resultats.push(...matchsSemaine);
    });

    return resultats;
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
