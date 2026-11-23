# com-hebdo/resolution-equipes Specification

## Purpose

Cette capacité définit la résolution des noms de collectifs du club (championnats et compétitions de coupe), la reconnaissance fiable des rencontres concernant le club ou ses ententes, ainsi que la détermination du statut domicile/extérieur et l'affichage des matchs tiers lors des triangulaires à partir des exports CSV GestHand.

## Requirements

### Requirement: Résolution prioritaire des poules de championnat
Le système SHALL résoudre en priorité le nom court d'un collectif par correspondance exacte sur le code de poule GestHand (`num poule`), avec désambiguïsation par le nom de l'équipe du club lorsqu'une même poule regroupe plusieurs équipes du club.

#### Scenario: Poule de championnat connue
- **WHEN** une ligne CSV possède un `num poule` présent dans le référentiel des poules de championnat (ex. `M62000201G`)
- **THEN** le nom de collectif affiché est le libellé configuré correspondant (`SM-1`)

#### Scenario: Poule partagée par deux équipes du club
- **WHEN** une ligne CSV possède un `num poule` partagé entre La Chapelaine et Porterie (ex. `Z624470051`)
- **THEN** le nom de collectif affiché distingue chaque équipe selon le nom de notre équipe dans la rencontre (`U11M-2` ou `U11M-Porterie`)

### Requirement: Résolution des collectifs en compétition de coupe indépendamment du tour
Lorsqu'un `num poule` n'est pas trouvé dans le référentiel des poules de championnat, le système SHALL résoudre le nom de collectif des matchs de coupe à partir du libellé de la colonne `competition` (insensible à la casse et aux accents) et, si nécessaire, du numéro de club porteur de notre équipe, afin de conserver les mêmes libellés de collectif quel que soit le tour ou la triangulaire.

#### Scenario: Coupe de France régionale tous tours confondus
- **WHEN** une ligne CSV concerne la Coupe de France régionale féminine (`F50001370R` au 1er tour ou `F50001371R` au 2e tour) ou masculine (`M50001370R`) avec un libellé de compétition contenant éventuellement un sponsor
- **THEN** le nom de collectif résolu est `SF-1` pour la compétition féminine et `SM-1` pour la compétition masculine

#### Scenario: Coupe Pays de la Loire régionale masculine
- **WHEN** une ligne CSV concerne la compétition `coupe pays de la loire regionale masculine` (`M62001001U`)
- **THEN** le nom de collectif résolu est `SM-1`

#### Scenario: Coupe de France départementale féminine
- **WHEN** une ligne CSV concerne la compétition départementale féminine de Coupe de France (`F50001970D`) avec l'équipe de Porterie (`6244021`)
- **THEN** le nom de collectif résolu est `SF-2`

#### Scenario: Coupe départementale masculine partagée entre deux collectifs
- **WHEN** deux rencontres de Coupe de France départementale masculine (`M50001970D`) ou de Coupe Pays de la Loire départementale masculine (`M62001000U`) impliquent respectivement Porterie (`6244021`) et HBC Gesvres / Alliance Erdre et Gesvres (`6244085`)
- **THEN** la rencontre de Porterie affiche le collectif `SM-3` et la rencontre de HBC Gesvres / Alliance Erdre et Gesvres affiche le collectif `SM-2`

#### Scenario: Coupes jeunes départementales 44
- **WHEN** une ligne CSV concerne une coupe jeune 44 (`coupe u13f - 44`, `coupe u14m - 44`, `coupe u15f - 44`, `coupe u16m - 44`, `coupe u17f - 44` ou `coupe u19m - 44`) avec une poule de type `TRIANGULAIRE N` ou `MATCH N`
- **THEN** le nom de collectif résolu est respectivement `U13F-1`, `U14M-1`, `U15F-1`, `U16M-1`, `U17F-1` ou `U19M-1`

#### Scenario: Compétition inconnue non référencée
- **WHEN** une ligne CSV ne correspond ni au référentiel des poules ni aux règles de coupe
- **THEN** le système conserve la valeur brute de la colonne `poule` du CSV sans provoquer d'erreur

### Requirement: Reconnaissance fiable des équipes du club à l'import
Le système SHALL identifier les rencontres appartenant au club ou à ses ententes en vérifiant à la fois les numéros fédéraux des clubs propres (`6244038` pour La Chapelaine, `6244021` pour Porterie) et les noms connus du club et de ses ententes, sans importer les équipes propres non-entente du club partenaire HBC Gesvres (`6244085`).

#### Scenario: Faute de frappe GestHand sur le nom de La Chapelaine
- **WHEN** une rencontre de Coupe de France régionale masculine indique `CHAPELAIN HB-PORTE DE L'ERDRE` avec le numéro de club `6244038`
- **THEN** la rencontre est conservée à l'import, identifiée comme un match du club et résolue avec le collectif `SM-1`

#### Scenario: Filtrage des équipes propres d'un club partenaire
- **WHEN** un export CSV du HBC Gesvres (`6244085`) contient une rencontre d'une équipe propre `HANDBALL CLUB DU GESVRES` contre un autre club tiers (sans mention `ALLIANCE ERDRE ET GESVRES` et sans La Chapelaine ni Porterie)
- **THEN** la rencontre est ignorée à l'import

### Requirement: Détermination domicile/extérieur lors des triangulaires et ententes
Le système SHALL déterminer si un match est à domicile en donnant priorité au champ `club hote` lorsqu'il est renseigné, tout en reconnaissant comme matchs à domicile les rencontres d'entente reçues par le club partenaire HBC Gesvres.

#### Scenario: Triangulaire jouée chez un club adverse
- **WHEN** un match de triangulaire de coupe (ex. `U17F-1` au Landreau ou `U19M-1` à Ancenis) place notre équipe en colonne `club rec` mais indique un autre club dans `club hote` (`LE LANDREAU HANDBALL` ou `ANCENIS HANDBALL`)
- **THEN** la rencontre est classée à l'extérieur (`estDomicile = false`)

#### Scenario: Match d'entente reçu par HBC Gesvres
- **WHEN** un match de championnat de `SM-2` ou `U19M-2` indique `HANDBALL CLUB DU GESVRES` dans `club hote` et une entente `HBC GESVRES * ALLIANCE ERDRE ET GESVRES` dans `club rec`
- **THEN** la rencontre est classée à domicile (`estDomicile = true`)

#### Scenario: Fichier de résultats sans colonne club hôte
- **WHEN** une rencontre provient d'un fichier de résultats dépourvu de colonne `club hote`
- **THEN** le statut domicile/extérieur est déterminé à partir de l'équipe recevante (`club rec` / `Num rec`)

### Requirement: Affichage explicite des matchs tiers hébergés en triangulaire
Lorsqu'une rencontre de triangulaire est hébergée dans un gymnase du club (`club hote` est notre club) mais oppose deux clubs adverses sans que notre équipe ne joue le match, le système SHALL conserver le collectif hôte pour la catégorie et afficher les deux clubs adverses dans le champ adversaire au format `<Club recevant> vs <Club visiteur>`.

#### Scenario: Match entre deux clubs adverses hébergé à La Chapelaine
- **WHEN** une triangulaire de coupe U14M (`M62445501U`) ou U16M (`M62444503U`) hébergée par `LA CHAPELAINE` comporte une rencontre entre `NORT AC HANDBALL` et `FANS HB LIGNE` (ou `SAVENAY HB` et `MONTBERT-AIGREFEUILLE HANDBALL`)
- **THEN** la rencontre est conservée à domicile avec le collectif hôte (`U14M-1` ou `U16M-1`) et le champ adversaire affiche `Nort vs Ligné` (ou `Savenay vs Montbert-Aigrefeuille`) au lieu de dupliquer le nom du visiteur seul

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
