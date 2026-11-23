# Proposal

## Why

Lors de l'import des exports CSV GestHand dans le module `com-hebdo`, tous les matchs de coupe (Coupe de France, Coupe Pays de la Loire et Coupes Jeunes 44) affichent la valeur brute de la colonne `poule` (`1ER TOUR`, `2° TOUR`, `TRIANGULAIRE 5`, `MATCH 10`, `COUPE PDLL MASC DEP ; 1E TOUR`, etc.) à la place du nom de collectif du club (`SF-1`, `SM-1`, `SM-2`, `SM-3`, `SF-2`, `U13F-1`…). De plus, une faute de frappe GestHand (`CHAPELAIN` sans `E`) fait disparaître un match de Coupe de France des `SM-1` à l'import, et les triangulaires de coupe présentent des erreurs de détection domicile/extérieur et de doublon d'adversaire.

## What Changes

- Ajout d'un mécanisme de résolution des compétitions de coupe par règles déclaratives dans `js/com-hebdo/competitions.js` (basé sur la colonne `competition` et le numéro de club de notre équipe), en complément du mapping exact par `num poule` utilisé pour les championnats.
- Suppression des codes obsolètes de Coupe de France (`M50001300R`, `F50001300R`) dans `POULES`, remplacés par les règles de coupe durables sur toute la saison (indépendantes des changements de `num poule` à chaque tour).
- Désambiguïsation par numéro de club (`6244021` Porterie → `SM-3`, `6244085` HBC Gesvres / Alliance Erdre et Gesvres → `SM-2`) lorsque plusieurs collectifs participent à une même coupe départementale.
- Renforcement de la reconnaissance de nos équipes à l'import et au nettoyage en prenant en compte les numéros de club officiels de La Chapelaine (`6244038`) et Porterie (`6244021`) ainsi que la variante orthographique `CHAPELAIN`, afin de ne plus filtrer à tort les rencontres comportant une faute de frappe GestHand.
- Correction de la gestion des triangulaires de coupe :
  - Priorité au champ `club hote` pour déterminer le statut domicile/extérieur tout en préservant les matchs d'entente reçus par le club partenaire HBC Gesvres (`SM-2`, `U19M-2`).
  - Affichage explicite des deux équipes (`<recevant> vs <visiteur>`) pour les matchs tiers hébergés dans notre gymnase lors d'une triangulaire.
- Mise à jour de la documentation `docs/com-hebdo.md` pour refléter la résolution des coupes et le fonctionnement des triangulaires.

## Capabilities

### New Capabilities
- `com-hebdo/resolution-equipes`: Résolution des noms de collectifs (championnats et coupes), reconnaissance fiable des équipes du club et gestion domicile/extérieur et matchs tiers en triangulaire lors du traitement des CSV GestHand.

### Modified Capabilities
<!-- Aucune spécification existante dans openspec/specs/ à modifier. -->

## Impact

- Code applicatif concerné :
  - `js/com-hebdo/competitions.js` : ajout des règles `COUPES`, extension de `nomPoule()`, nettoyage des clés obsolètes de CdF dans `POULES`.
  - `js/com-hebdo/data-extractor.js` : filtrage à l'import par nom ou numéro de club, extraction du numéro de club de notre équipe (`_numNous`) en plus de `_nous`.
  - `js/com-hebdo/data-cleaner.js` : reconnaissance robuste de nos équipes (`estNotreClub` / `estNotreEquipe`), priorité corrigée de `isMatchDom()` pour les triangulaires et les ententes HBC Gesvres, formatage des matchs tiers hébergés en triangulaire dans `nettoyer()`.
- Documentation concernée :
  - `docs/com-hebdo.md`
- Aucune dépendance externe ajoutée ; compatibilité totale avec les rendus existants (`kifekoi-renderer.js`, `visuel-renderer.js`, `google-sheets.js`) qui consomment toujours `poule`, `adversaire` et `estDomicile`.
