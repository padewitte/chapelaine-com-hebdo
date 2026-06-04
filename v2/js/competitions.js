/**
 * Mapping poule GestHand → nom affiché dans le kifekoi.
 * Clé   = valeur exacte du champ "poule" dans le CSV
 * Valeur = nom libre choisi par le club
 *
 * Si une poule n'est pas listée ici, la valeur brute du CSV est affichée.
 */
export const POULES = {
  // École de hand
  'TOURNOI 1 FEMININ':   'EDH-F T1',
  'TOURNOI 2 FEMININ':   'EDH-F T2',
  'TOURNOI 6 MIXTE':     'EDH-Mixte T6',
  'TOURNOI 10 MIXTE':    'EDH-Mixte T10',
  'TOURNOI MIXTE 13':    'EDH-Mixte T13',

  // U10
  'U10M D6':   'U10-M D6',

  // U11
  'U11F D1B':  'U11-F D1B',
  'U11F D4':   'U11-F D4',
  'U11M D4':   'U11-M D4',

  // U12
  'U12M D2':   'U12-M D2',
  'U12M D3':   'U12-M D3',
  'U12M D13':  'U12-M D13',

  // U13
  'U13F D3':   'U13-F D3',
  'U13F D6':   'U13-F D6',

  // U14
  'U14M D2':   'U14-M D2',
  'U14M D8':   'U14-M D8',

  // U15
  'U15F D2':   'U15-F D2',
  'U15F D6':   'U15-F D6',

  // U16
  'U16M D3':   'U16-M D3',
  'U16M D9':   'U16-M D9',

  // U19
  'U19M D1':   'U19-M D1',
  'U19M D7':   'U19-M D7',

  // U20
  'U20FPL; POULE CD1':                              'U20-F CD1',
  'U20F - PORTES DE L\'ERDRE - RACC HANDBALL':      'U20-F Alliance',

  // Séniors
  'HMPL ; HONNEUR-ME PDLL; POULE B':         'SM-1',
  'HFPL ; HONNEUR FEMININE REGIONALE ;POULE A':     'SF-1',
  'D2FPL-C ; POULE C':                              'SF-2',
  '1DTM POULE BASSE A':                             'SM-2',
};

export function nomPoule(poule) {
  return POULES[poule] ?? poule;
}
