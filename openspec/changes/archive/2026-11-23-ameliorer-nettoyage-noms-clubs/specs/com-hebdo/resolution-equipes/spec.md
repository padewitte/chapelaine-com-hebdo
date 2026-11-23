# Spec Delta

## ADDED Requirements

### Requirement: Nettoyage automatique épuré des noms de clubs adverses et d'ententes
Le système SHALL nettoyer les libellés bruts GestHand des clubs adverses et hôtes en supprimant les préfixes de compétition (avec ou sans tiret), les suffixes de catégorie, les termes génériques et les sigles associatifs, en normalisant les séparateurs d'entente (`*` et `E.`) en ` & `, et en conservant l'acronyme `HBC` ainsi que le numéro d'équipe final (`1`, `2`, `3`, `4`), y compris pour les clubs résolus via `CLUBS`.

#### Scenario: Entente hors département avec préfixe de division sans tiret et préfixe E.
- **WHEN** le libellé brut GestHand est `D2M85 E.POIRE *VIE ET YON 2`
- **THEN** le nom nettoyé affiché est `Poire & Vie Et Yon 2`

#### Scenario: Entente départementale ou régionale avec séparateur étoile et abréviation HB
- **WHEN** le libellé brut GestHand est `1DTM44C - ALSEM * ESTUAIRE ET SILLON HB`, `HONM62C-DOMPIERROIS*VIE & YON HB 1` ou `HONF62C-LA FLECHE*HBC SABLE`
- **THEN** le nom nettoyé affiché est respectivement `Alsem & Estuaire Et Sillon`, `Dompierrois & Vie & Yon 1` et `La Fleche & HBC Sable`

#### Scenario: Nettoyage épuré des sigles associatifs et conservation de HBC
- **WHEN** le libellé brut GestHand est `AAEEC PONTS DE CE`, `ASCED RIAILLE`, `CJ BOUGUENAIS HANDBALL`, `CARQUEFOU HB 2`, `SAVENAY HB 1F` ou `HBC NANTES 2`
- **THEN** le nom nettoyé affiché est respectivement `Ponts De Ce`, `Riaille`, `Bouguenais`, `Carquefou 2`, `Savenay` et `HBC Nantes 2`

#### Scenario: Conservation du numéro d'équipe pour un club du dictionnaire CLUBS
- **WHEN** le libellé brut GestHand est `ASPTT NANTES 2`, `PONT-CHATEAU HANDBALL 2` ou `RACC NANTES 1 - U19M`
- **THEN** le nom nettoyé affiché est respectivement `ASPTT 2`, `Pont-Château 2` et `RACC 1`

### Requirement: Tri des résultats par catégorie des plus jeunes aux plus anciens
Dans le visuel des résultats, le système SHALL trier les rencontres par catégorie d'âge croissante, des plus jeunes aux plus anciens (`U11` à `U19`, puis Séniors `SF` et `SM`, puis autres compétitions), et à catégorie d'âge égale par libellé de collectif (`U11F-1`, `U11M-1`, `U11M-2`, `U11M-Porterie`, etc.).

#### Scenario: Affichage ordonné des résultats d'un week-end complet
- **WHEN** plusieurs fichiers de résultats couvrant des équipes jeunes (`U11F-1`, `U11M-1`, `U12M-1`, `U13F-1`, `U19M-1`) et séniors (`SF-1`, `SM-1`, `SM-2`, `SM-3`) sont importés dans un ordre quelconque
- **THEN** le visuel des résultats affiche d'abord les catégories jeunes par âge croissant (`U11F-1`, `U11M-1`, `U11M-2`, `U11M-Porterie`, `U12M-1`, `U12M-2`, `U13F-1`… jusqu'à `U19M-2`) puis les catégories séniors (`SF-1`, `SM-1`, `SM-2`, `SM-3`)

## MODIFIED Requirements

### Requirement: Affichage explicite des matchs tiers hébergés en triangulaire
Lorsqu'une rencontre de triangulaire est hébergée dans un gymnase du club (`club hote` est notre club) mais oppose deux clubs adverses sans que notre équipe ne joue le match, le système SHALL conserver le collectif hôte pour la catégorie et afficher les deux clubs adverses dans le champ adversaire au format `<Club recevant> vs <Club visiteur>`.

#### Scenario: Match entre deux clubs adverses hébergé à La Chapelaine
- **WHEN** une triangulaire de coupe U14M (`M62445501U`) ou U16M (`M62444503U`) hébergée par `LA CHAPELAINE` comporte une rencontre entre `NORT AC HANDBALL` et `FANS HB LIGNE` (ou `SAVENAY HB` et `MONTBERT-AIGREFEUILLE HANDBALL`)
- **THEN** la rencontre est conservée à domicile avec le collectif hôte (`U14M-1` ou `U16M-1`) et le champ adversaire affiche `Nort vs Ligné` (ou `Savenay vs Montbert-Aigrefeuille`) au lieu de dupliquer le nom du visiteur seul
