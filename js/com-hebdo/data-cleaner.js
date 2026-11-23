import { nomPoule, nomClub } from './competitions.js';

const NOMS_CLUB_DOM  = ['CHAPELAINE', 'CHAPELAIN', 'LA CHAPELAINE', 'PORTERIE HB', 'PORTERIE', 'ST JOSEPH PORTERIE', 'ALLIANCE ERDRE ET GESVRES'];
const CODES_CLUB_DOM = ['6244038', '6244021']; // La Chapelaine, Porterie

export const estNotreClub = nom =>
  NOMS_CLUB_DOM.some(n => (nom || '').toUpperCase().includes(n));

export const estNotreEquipe = (nom, numClub) =>
  CODES_CLUB_DOM.includes((numClub || '').trim()) || estNotreClub(nom);

const SALLES_DOM    = ['COUTANCIERE', 'JAHAN', 'OLYMPIE'];

export const DataCleaner = {

  isTournoi(poule, rawPoule) {
    const p = (poule || '').trim().toLowerCase();
    const raw = (rawPoule || '').trim().toLowerCase();
    return p.includes('tournoi') || raw.includes('tournoi');
  },

  // Match entre deux clubs adverses hébergé dans notre gymnase (ex. triangulaire de coupe).
  estMatchTiersHeberge(ligne, estDomicile) {
    const rec = (ligne['club rec'] || '').trim();
    const vis = (ligne['club vis'] || '').trim();
    if (!estDomicile || !rec || !vis) return false;
    return !estNotreEquipe(rec, ligne['Num rec']) && !estNotreEquipe(vis, ligne['Num vis']);
  },

  nettoyer(ligne) {
    const estDomicile  = this.isMatchDom(ligne);
    const salle        = this.detecterSalle(ligne, estDomicile);
    const poule        = nomPoule(ligne['num poule'], ligne['poule'], ligne['_nous'], ligne['competition'], ligne['_numNous']);
    const tournoi      = this.isTournoi(poule, ligne['poule']);
    const tiersHeberge = this.estMatchTiersHeberge(ligne, estDomicile);

    let adversaire;
    if (tournoi) {
      adversaire = 'Tournoi Détection';
    } else if (tiersHeberge) {
      adversaire = `${this.cleanNomEquipe(ligne['club rec'])} vs ${this.cleanNomEquipe(ligne['club vis'])}`;
    } else {
      const { nom, num } = this.clubAdverse(ligne, estDomicile);
      adversaire = this.nomEquipe(ligne, nom, num);
    }

    return {
      salle,
      estDomicile,
      jour:        this.cleanDate(ligne['le']),
      dateISO:     this.toISO(ligne['le']),
      horaire:     this.formatHeure(ligne['horaire']),
      poule,
      adversaire,
      nom_salle:   ligne['nom salle'] || '',
      competition: ligne['competition'] || '',
      arb1:        ligne['arb1 designe'] || '',
      arb2:        ligne['arb2 designe'] || '',
      club_hote:   this.cleanNomEquipe(ligne['club hote'] || ''),
    };
  },

  // L'adversaire est le club qui n'est pas le nôtre dans cette poule (_nous,
  // posé à l'import). Sans _nous — tournoi, poule d'un seul match — on retombe
  // sur le côté opposé au nôtre.
  clubAdverse(ligne, estDomicile) {
    const nous = ligne['_nous'];
    const rec  = ligne['club rec'] || '';
    const vis  = ligne['club vis'] || '';
    if (nous && rec === nous) return { nom: vis, num: ligne['Num vis'] || '' };
    if (nous && vis === nous) return { nom: rec, num: ligne['Num rec'] || '' };
    return estDomicile
      ? { nom: vis, num: ligne['Num vis'] || '' }
      : { nom: rec, num: ligne['Num rec'] || '' };
  },

  // Derby entre deux de nos équipes : l'adversaire prend son nom court.
  nomEquipe(ligne, club, numClub = '') {
    return estNotreEquipe(club, numClub)
      ? nomPoule(ligne['num poule'], ligne['poule'], club, ligne['competition'], numClub)
      : this.cleanNomEquipe(club);
  },

  isMatchDom(ligne) {
    const hote   = (ligne['club hote'] || '').trim();
    const rec    = ligne['club rec'] || '';
    const numRec = ligne['Num rec']  || '';

    if (hote) {
      if (estNotreClub(hote)) return true;
      // Entente reçue par le club partenaire (ex. HBC Gesvres pour Alliance Erdre et Gesvres).
      if (estNotreEquipe(rec, numRec) && hote.toUpperCase().includes('GESVRES') && rec.toUpperCase().includes('GESVRES')) {
        return true;
      }
      return false;
    }

    return estNotreEquipe(rec, numRec);
  },

  // Retourne 'coutanciere' | 'jahan' | 'olympie' | 'exterieur' | 'non-defini' (voir README).
  detecterSalle(ligne, estDomicile) {
    if (!ligne['le']) return 'non-defini';
    if (!estDomicile) return 'exterieur';
    const salle = (ligne['nom salle'] || '').toUpperCase();
    if (salle.includes('JAHAN')) return 'jahan';
    if (salle.includes('OLYMPIE')) return 'olympie';
    // Entente reçue dans un autre gymnase du club partenaire.
    if (salle && !SALLES_DOM.some(s => salle.includes(s))) return 'exterieur';
    return 'coutanciere';
  },

  formatHeure(horaire) {
    if (!horaire) return '';
    const [h, m] = horaire.split(':');
    return `${parseInt(h)}h${m}`;
  },

  cleanDate(dateStr) {
    if (!dateStr) return '';
    const [jour, mois, annee] = dateStr.split('/');
    const date = new Date(`${annee}-${mois}-${jour}`);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  },

  toISO(dateStr) {
    if (!dateStr) return '';
    const [jour, mois, annee] = dateStr.split('/');
    return `${annee}-${mois}-${jour}`;
  },

  nettoyerResultat(ligne) {
    const estDomicile = this.isMatchDom(ligne);
    const scoreRec = ligne['sc rec'] || ligne['fdme rec'] || '';
    const scoreVis = ligne['sc vis'] || ligne['fdme vis'] || '';
    if (!scoreRec && !scoreVis) return null;

    const scoreNous  = estDomicile ? scoreRec : scoreVis;
    const scoreEux   = estDomicile ? scoreVis : scoreRec;
    const victoire   = parseInt(scoreNous) > parseInt(scoreEux) ? 'victoire'
                     : parseInt(scoreNous) < parseInt(scoreEux) ? 'defaite'
                     : 'egalite';

    const poule   = nomPoule(ligne['num poule'], ligne['poule'], ligne['_nous'], ligne['competition'], ligne['_numNous']);
    const tournoi = this.isTournoi(poule, ligne['poule']);
    const advClub = estDomicile ? ligne['club vis'] : ligne['club rec'];
    const advNum  = estDomicile ? ligne['Num vis']  : ligne['Num rec'];
    const nomAdversaire = tournoi ? 'Tournoi Détection' : this.nomEquipe(ligne, advClub, advNum);
    // Derby : chaque côté porte le nom de sa propre équipe, quel que soit _nous.
    const derby = !tournoi
      && estNotreEquipe(ligne['club rec'], ligne['Num rec'])
      && estNotreEquipe(ligne['club vis'], ligne['Num vis']);

    return {
      jour:        this.cleanDate(ligne['le']),
      dateISO:     this.toISO(ligne['le']),
      poule,
      equipe_dom:  derby ? this.nomEquipe(ligne, ligne['club rec'], ligne['Num rec']) : estDomicile ? poule : nomAdversaire,
      equipe_ext:  derby ? this.nomEquipe(ligne, ligne['club vis'], ligne['Num vis']) : estDomicile ? nomAdversaire : poule,
      score_dom:   scoreRec,
      score_ext:   scoreVis,
      victoire,
      estDomicile,
    };
  },

  cleanNomEquipe(nom) {
    if (!nom) return '';

    // Les cas que les règles ci-dessous ne savent pas traiter sont listés à la
    // main dans CLUBS (competitions.js).
    const exception = nomClub(nom);
    if (exception) return exception;

    // 1. Supprimer les préfixes de compétition GestHand (avec ou sans tiret)
    //    ex: "HAU11M44E-", "HONM72C-", "1DTM44C - ", "D2M85 ", "U12M-44-EXC-C-", "C - "
    let cleaned = nom
      .replace(/^((?:HAU\w*|PRU\w*|HON[MF]?\w*|\d*DT[MF]\w*|D\d+[MF]\w*|U\d+[MF]\w*|\d{2}|EXC|PR|HA|C|D\d+)\s*-\s*)+/gi, '')
      .replace(/^(?:HAU\d+\w*|PRU\d+\w*|HON[MF]\d+\w*|\d*DT[MF]\d+\w*|D\d+[MF]\d+\w*|U\d+[MF]\d+\w*)\s+/gi, '');

    // Si un préfixe générique de code court précède un tiret
    if (cleaned === nom && nom.includes('-')) {
      const parts = nom.split('-');
      if (parts[0].trim().length <= 10 && !/\s/.test(parts[0].trim()) && !/^(PONT|MONTBERT|SAINT|SAINTE|LES|DES|SABLES)$/i.test(parts[0].trim())) {
        cleaned = parts.slice(1).join('-').trim();
      }
    }

    // 2. Normaliser les séparateurs d'entente "*" en " & " et le préfixe "E."
    cleaned = cleaned
      .replace(/(?:^|(?<=\*|\s))E\.\s*/gi, '')
      .replace(/\s*\*\s*/g, ' & ');

    // 3. Supprimer les suffixes de catégorie ("1M.2M", "1F", "- U19M")
    //    tout en conservant un éventuel numéro d'équipe final ("1", "2", "3", "4")
    const complet = cleaned
      .replace(/\s*-\s*U\d+[MF]\b/gi, '')
      .replace(/\s+\d[MFmf](\.\d[MFmf])*/g, '');

    // 4. Supprimer les termes génériques et sigles d'association tout en gardant HBC
    const court = complet
      .replace(/\bhandball\b/gi, '')
      .replace(/\bolympique\b/gi, '')
      .replace(/\bclub\b/gi, '')
      .replace(/\b(?:hb|hc|hbac|ohb|asb|aaeec|asced|al|as|cj|co|csc|es|us|ac|os|nov)\b/gi, '')
      .replace(/\b(?:association|sportive|entente|union)\b/gi, '');

    // Les noms que ce raccourci vide de leur sens ("HANDBALL CLUB DU GESVRES")
    // sont traités par CLUBS ; ici on garde seulement le filet du nom vide.
    return (court.trim() ? court : complet)
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s*&\s*|\s*&\s*$/g, '')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace(/\bHbc\b/g, 'HBC');
  },

};
