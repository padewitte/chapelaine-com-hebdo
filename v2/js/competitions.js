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
  'U12M - HONNEUR A - POULE 6':   'U12-M',
  'U12M D3':   'U12-M D3',
  'U12M D13':  'U12-M D13',

  // U13
  'TOURNOI U13F HONNEUR A A GUERANDE':   'U13-F 1',
  'TOURNOI U13F HONNEUR A A TREILLIERES':   'U13-F 2',

  // U14
  'U14M - PRE REGION - POULE B':   'U14-M 1',
  'U14M D8':   'U14-M D8',

  // U15
  'TOURNOI U15F HONNEUR A A BLAIN' :  'U15-F 1',
  'TOURNOI U15F HONNEUR A A SUCE/ERDRE' :  'U15-F 2',
  'U15F D2':   'U15-F D2',
  'U15F D6':   'U15-F D6',

  // U16
  'U16M - HONNEUR A - POULE 2':   'U16-M 1',
  'U16M - HONNEUR A - POULE 4':   'U16-M 2',

  // U17F
  'U17F - PRE REGION - POULE B':   'U17-F',

  // U19
  'U19M - HONNEUR A - POULE 4':   'U19-M 1',
  'U19M D7':   'U19-M D7',

  // U20
  'U20FPL; POULE CD1':                              'U20-F CD1',
  'U20F - PORTES DE L\'ERDRE - RACC HANDBALL':      'U20-F Alliance',

  // Séniors
  'HMPL; POULE B':         'SM-1 Reg',
  'HFPL ; HONNEUR FEMININE REGIONALE ;POULE A':     'SF-1',
  'D2FPL-C ; POULE C':                              'SF-2',
  '2DTM - POULE 2':                             'SM-3 D2',
  '3DTM - POULE 5':                             'SM-4 D3',
};

export function nomPoule(poule) {
  return POULES[poule] ?? poule;
}
