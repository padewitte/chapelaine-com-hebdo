import { nomPoule } from './competitions.js';

const NOMS_CLUB_DOM = ['CHAPELAINE', 'LA CHAPELAINE', 'PORTERIE HB', 'PORTERIE', 'ST JOSEPH PORTERIE'];
const SALLES_DOM    = ['COUTANCIERE', 'JAHAN'];

export const DataCleaner = {

  isTournoi(poule, rawPoule) {
    const p = (poule || '').trim().toLowerCase();
    const raw = (rawPoule || '').trim().toLowerCase();
    return p.includes('tournoi') || raw.includes('tournoi');
  },

  nettoyer(ligne) {
    const estDomicile = this.isMatchDom(ligne);
    const salle       = this.detecterSalle(ligne, estDomicile);
    const poule       = nomPoule(ligne['poule']);
    const tournoi     = this.isTournoi(poule, ligne['poule']);

    return {
      salle,
      estDomicile,
      jour:        this.cleanDate(ligne['le']),
      dateISO:     this.toISO(ligne['le']),
      horaire:     this.formatHeure(ligne['horaire']),
      poule,
      equipe_dom:  tournoi && !estDomicile ? 'Tournoi Détection' : this.cleanNomEquipe(ligne['club rec']),
      equipe_ext:  tournoi ? 'Tournoi Détection' : this.cleanNomEquipe(ligne['club vis']),
      nom_salle:   ligne['nom salle'] || '',
      competition: ligne['competition'] || '',
      arb1:        ligne['arb1 designe'] || '',
      arb2:        ligne['arb2 designe'] || '',
      club_hote:   this.cleanNomEquipe(ligne['club hote'] || ''),
    };
  },

  isMatchDom(ligne) {
    const hote = (ligne['club hote'] || '').toUpperCase();
    const rec  = (ligne['club rec']  || '').toUpperCase();
    return NOMS_CLUB_DOM.some(n => hote.includes(n) || rec.includes(n));
  },

  // Retourne 'coutanciere' | 'jahan' | 'exterieur'
  detecterSalle(ligne, estDomicile) {
    if (!estDomicile) return 'exterieur';
    const salle = (ligne['nom salle'] || '').toUpperCase();
    if (salle.includes('COUTANCIERE')) return 'coutanciere';
    if (salle.includes('JAHAN'))       return 'jahan';
    return 'exterieur';
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

    const poule   = nomPoule(ligne['poule']);
    const tournoi = this.isTournoi(poule, ligne['poule']);

    return {
      jour:        this.cleanDate(ligne['le']),
      dateISO:     this.toISO(ligne['le']),
      poule,
      equipe_ext:  tournoi ? 'Tournoi Détection' : this.cleanNomEquipe(estDomicile ? ligne['club vis'] : ligne['club rec']),
      score_dom:   scoreRec,
      score_ext:   scoreVis,
      victoire,
      estDomicile,
    };
  },

  cleanNomEquipe(nom) {
    if (!nom) return '';

    // Supprimer les préfixes de compétition GestHand suivis d'un tiret (ex: "HAU11M44E-", "HONM72C-", "U12M-44-EXC-C-", "C - ")
    let cleaned = nom.replace(/^((?:HAU\w*|PRU\w*|HON[MF]?\w*|U\d+[MF]\b\s*\d*|\d{2}|EXC|PR|HA|C|D\d+)\s*-\s*)+/gi, '');

    // Si un préfixe générique de code court précède un tiret
    if (cleaned === nom && nom.includes('-')) {
      const parts = nom.split('-');
      if (parts[0].trim().length <= 10 && !/\s/.test(parts[0].trim()) && !/^(PONT|MONTBERT|SAINT|SAINTE|LES|DES|SABLES)$/i.test(parts[0].trim())) {
        cleaned = parts.slice(1).join('-').trim();
      }
    }

    return cleaned
      .replace(/\s+\d[MFmf](\.\d[MFmf])*/g, '') // supprime suffixes 1M.2M etc.
      .replace(/\bhandball\b/gi, '')
      .replace(/\bolympique\b/gi, '')
      .replace(/\bclub\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  },

};
