/**
 * Mapping poule GestHand → nom court affiché dans le kifekoi.
 * Clé   = champ "num poule" du CSV (code opaque, jamais affiché, un par poule)
 * Valeur = nom court choisi par le club, à renseigner à la main chaque saison
 *
 * Plusieurs poules peuvent porter le même nom court : le championnat d'une
 * équipe et ses tournois de détection sont la même équipe.
 *
 * Si un code n'est pas listé ici, la poule brute du CSV est affichée.
 */
export const POULES = {
  // Jeunes
  'F624470061': 'U11F-1',   // u11f-44 / HONNEUR B - POULE 4
  'Z624470041': 'U11M-1',   // u11 mixte - 44 / HONNEUR A - POULE 5
  'Z624470051': 'U11M-2',   // u11 mixte - 44 / HONNEUR B - POULE 1
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

  // Amicales
  'F62440004A': 'TP-F',     // amicale h7 féminine : comite 44 / Trophée Patrick Féminin

  // Séniors
  'M62000201G': 'SM-1',     // hmpl; honneur masculine regionale / POULE B
  'M624401011': 'SM-2',     // 2dtm-44 / 2DTM - POULE 2
  'M624402041': 'SM-3',     // 3dtm-44 / 3DTM - POULE 5
  'F62000200G': 'SF-1',     // hfpl ; honneur feminine regionale / POULE A
  'F62000301G': 'SF-2',     // d1fpl ; division 1 feminine territoriale / POULE B

  // Coupe de France
  'M50001300R': 'SM-1',    // coupe de france regionale masculine 2026-2027
  'F50001300R': 'SF-1',    // coupe de france regionale feminine 2026-2027
};

export function nomPoule(numPoule, poule) {
  return POULES[numPoule] ?? poule ?? '';
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
  'HANDBALL CLUB DU GESVRES': 'HBC Gesvres'
};

// La plus longue d'abord : la clé la plus précise l'emporte.
const CLES_CLUBS = Object.keys(CLUBS).sort((a, b) => b.trim().length - a.trim().length);

export function nomClub(brut) {
  const nom = (brut || '').toUpperCase();
  const cle = CLES_CLUBS.find(c => nom.includes(c.trim().toUpperCase()));
  return cle ? CLUBS[cle] : null;
}
