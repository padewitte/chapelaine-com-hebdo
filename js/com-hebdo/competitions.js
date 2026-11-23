/**
 * Mapping poule GestHand → nom court affiché dans le kifekoi.
 * Clé   = champ "num poule" du CSV (code opaque, jamais affiché, un par poule)
 * Valeur = nom court choisi par le club, à renseigner à la main chaque saison
 *
 * Plusieurs poules peuvent porter le même nom court : le championnat d'une
 * équipe et ses tournois de détection sont la même équipe.
 *
 * Quand plusieurs de nos équipes jouent dans la même poule, la valeur est un
 * objet { fragment du nom de notre équipe : nom court }.
 *
 * Si un code n'est pas listé ici, la poule brute du CSV est affichée.
 */
export const POULES = {
  // Jeunes
  'F624470061': 'U11F-1',   // u11f-44 / HONNEUR B - POULE 4
  'Z624470041': 'U11M-1',   // u11 mixte - 44 / HONNEUR A - POULE 5
  'Z624470051': {           // u11 mixte - 44 / HONNEUR B - POULE 1 : deux de nos équipes
    'CHAPELAINE': 'U11M-2',
    'PORTERIE':   'U11M-Porterie',
  },
  'M624465071': 'U12M-1',   // u12m-44 / HONNEUR A - POULE 6
  'M624465091': 'U12M-2',   // u12m-44 / HONNEUR B - POULE 2
  'F624460041': 'U13F-1',   // u13f-44 / HONNEUR A - POULE 4        (Chapelaine)
  'F62446006A': 'U13F-1',   // detection u13f / TOURNOI A GUERANDE
  'F624460031': 'U13F-2',   // u13f-44 / HONNEUR A - POULE 3        (Porterie)
  'F62446002A': 'U13F-2',   // detection u13f / TOURNOI A TREILLIERES
  'M624455011': 'U14M-1',   // u14m-44 / PRE REGION - POULE B
  'M62445502A': 'U14M-1',   // detection u14m / TOURNOI PRE REGION A NANTES
  'M624455121': 'U14M-2',   // u14m-44 / HONNEUR B - POULE 3
  'F624450051': 'U15F-1',   // u15f-44 / HONNEUR A - POULE 3        (Chapelaine)
  'F62445003A': 'U15F-1',   // detection u15f / TOURNOI A SUCE/ERDRE
  'F624450041': 'U15F-2',   // u15f-44 / HONNEUR A - POULE 2        (Porterie)
  'F62445005A': 'U15F-2',   // detection u15f / TOURNOI A BLAIN
  'M624445041': 'U16M-1',   // u16m-44 / HONNEUR A - POULE 2        (Chapelaine)
  'M624445061': 'U16M-2',   // u16m-44 / HONNEUR A - POULE 4        (Porterie)
  'F624440011': 'U17F-1',   // u17f-44 / PRE REGION - POULE B
  'M624430071': 'U19M-1',   // u19m-44 / HONNEUR A - POULE 4
  'M624430061': 'U19M-2',   // u19m-44 / HONNEUR A - POULE 3        (Alliance Erdre et Gesvres)

  // Amicales
  'F62440004A': 'TP-F',     // amicale h7 féminine : comite 44 / Trophée Patrick Féminin

  // Séniors
  'M62000201G': 'SM-1',     // hmpl; honneur masculine regionale / POULE B
  'M624400031': 'SM-2',     // 1dtm-44 / 1DTM - POULE 3             (Alliance Erdre et Gesvres)
  'M624401011': 'SM-3',     // 2dtm-44 / 2DTM - POULE 2
  'M624402041': 'SM-4',     // 3dtm-44 / 3DTM - POULE 5
  'F62000200G': 'SF-1',     // hfpl ; honneur feminine regionale / POULE A
  'F62000301G': 'SF-2',     // d1fpl ; division 1 feminine territoriale / POULE B
};

/**
 * Règles de résolution pour les compétitions de coupe.
 * En coupe, GestHand génère un nouveau "num poule" à chaque tour et pour
 * chaque triangulaire : on s'appuie donc sur la colonne "competition"
 * (normalisée sans accents ni casse), avec désambiguïsation optionnelle par
 * numéro de club (parClub) ou fragment de nom d'équipe (parNom).
 */
export const COUPES = [
  // Coupes Jeunes 44
  { motif: /coupe\s+u13f\b/, nom: 'U13F-1' },
  { motif: /coupe\s+u14m\b/, nom: 'U14M-1' },
  { motif: /coupe\s+u15f\b/, nom: 'U15F-1' },
  { motif: /coupe\s+u16m\b/, nom: 'U16M-1' },
  { motif: /coupe\s+u17f\b/, nom: 'U17F-1' },
  { motif: /coupe\s+u19m\b/, nom: 'U19M-1' },

  // Coupe de France & Coupe Pays de la Loire (Séniors)
  { motif: /coupe.*regionale.*feminine/,      nom: 'SF-1' },
  { motif: /coupe.*regionale.*masculine/,     nom: 'SM-1' },
  { motif: /coupe.*departementale.*feminine/, nom: 'SF-2' },
  {
    motif: /coupe.*departementale.*masculine/,
    parClub: {
      '6244021': 'SM-3', // Porterie — Alliance Erdre et Gesvres
      '6244085': 'SM-2', // HBC Gesvres — Alliance Erdre et Gesvres
    },
    parNom: {
      'PORTERIE': 'SM-3',
      'GESVRES':  'SM-2',
    },
  },
];

function normaliserTexte(texte) {
  return (texte || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function nomCoupe(competition, nous, numNous) {
  const compNorm = normaliserTexte(competition);
  if (!compNorm) return undefined;

  const regle = COUPES.find(r => r.motif.test(compNorm));
  if (!regle) return undefined;

  if (regle.nom) return regle.nom;
  if (regle.parClub && numNous && regle.parClub[numNous]) {
    return regle.parClub[numNous];
  }
  if (regle.parNom) {
    const cle = Object.keys(regle.parNom).find(k => (nous || '').toUpperCase().includes(k));
    if (cle) return regle.parNom[cle];
  }
  return undefined;
}

// nous = nom GestHand de notre équipe dans la poule (ligne['_nous']).
// competition = colonne "competition" du CSV, numNous = numéro de club de notre équipe.
export function nomPoule(numPoule, poule, nous, competition = '', numNous = '') {
  let nom = POULES[numPoule];
  if (nom && typeof nom === 'object') {
    const cle = Object.keys(nom).find(k => (nous || '').toUpperCase().includes(k));
    nom = nom[cle];
  }
  if (!nom) {
    nom = nomCoupe(competition, nous, numNous);
  }
  return nom ?? poule ?? '';
}

/**
 * Exceptions de nom de club : les règles de nettoyage de data-cleaner.js
 * (suppression des préfixes de compétition, de "handball"/"club"/"olympique",
 * capitalisation) ne tombent pas juste sur tous les noms GestHand.
 *
 * Clé   = fragment de texte cherché dans la valeur du CSV ("club rec" /
 *          "club vis" / "club hote"), sans accent ni casse ni regexp
 * Valeur = nom affiché tel quel, capitalisation et accents compris
 *
 * Toute entrée qui CONTIENT la clé prend la valeur : 'REZE' couvre aussi bien
 * "ASB REZE HANDBALL" que "U14M44C - ASB REZE * ATLANTIQUE REZE HB". Les
 * variantes numérotées sont donc confondues ("MARSIEN 2" → "St Mars") ; pour
 * les distinguer, mettre une clé par équipe.
 *
 * À clés multiples, la plus longue gagne. Un club sans clé passe par les
 * règles habituelles.
 */
export const CLUBS = {
  'RACC':'RACC',
  'ASPTT':'ASPTT',
  'FANS HB LIGNE':'Ligné',
  'PONT-CHATEAU ': 'Pont-Château',
  'HBC BLINOIS': 'HBC Blinois',
  'HANDBALL CLUB MARSIEN': 'St Mars',
  'HBC HERBLINOIS': 'HBC Herblinois',
  'LAETITIA NANTES HB':'Laetitia',
  'REZE': 'Rezé',
  'SUCE SUR ERDRE': 'Sucé-sur-Erdre',
  'HANDBALL CLUB DU GESVRES': 'HBC Gesvres',
  'Thouare Hbc * Hbc Marsien': 'Thouaré & HBC Marsien',
  'Eclair Chauve Hb*Sud Estuaire Hc': 'Eclair Chauvé & Sud Estuaire',
};

// La plus longue d'abord : la clé la plus précise l'emporte.
const CLES_CLUBS = Object.keys(CLUBS).sort((a, b) => b.trim().length - a.trim().length);

export function nomClub(brut) {
  const nom = (brut || '').toUpperCase();
  const cle = CLES_CLUBS.find(c => nom.includes(c.trim().toUpperCase()));
  return cle ? CLUBS[cle] : null;
}
