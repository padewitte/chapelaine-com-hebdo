import { nomPoule } from './competitions.js';

const NOMS_CLUB_DOM = ['CHAPELAINE', 'LA CHAPELAINE', 'PORTERIE HB', 'PORTERIE', 'ST JOSEPH PORTERIE'];
const SALLES_DOM    = ['COUTANCIERE', 'JAHAN'];

export const DataCleaner = {

  nettoyer(ligne) {
    const estDomicile = this.isMatchDom(ligne);
    const salle       = this.detecterSalle(ligne, estDomicile);

    return {
      salle,
      estDomicile,
      jour:        this.cleanDate(ligne['le']),
      dateISO:     this.toISO(ligne['le']),
      horaire:     this.formatHeure(ligne['horaire']),
      poule:       nomPoule(ligne['poule']),
      equipe_dom:  this.cleanNomEquipe(ligne['club rec']),
      equipe_ext:  this.cleanNomEquipe(ligne['club vis']),
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

    return {
      jour:        this.cleanDate(ligne['le']),
      dateISO:     this.toISO(ligne['le']),
      poule:       nomPoule(ligne['poule']),
      equipe_ext:  this.cleanNomEquipe(estDomicile ? ligne['club vis'] : ligne['club rec']),
      score_dom:   scoreRec,
      score_ext:   scoreVis,
      victoire,
      estDomicile,
    };
  },

  cleanNomEquipe(nom) {
    if (!nom) return '';
    return nom
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
