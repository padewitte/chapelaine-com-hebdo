# Tasks

## 1. Résolution des collectifs en coupe (`competitions.js`)

- [x] 1.1 Ajouter la table déclarative `COUPES` dans `js/com-hebdo/competitions.js` (Coupes Jeunes 44, Coupe de France régionale/départementale F & M, Coupe Pays de la Loire régionale/départementale M avec désambiguïsation `6244021` → `SM-3` et `6244085` → `SM-2`), retirer les entrées obsolètes `M50001300R` et `F50001300R` de `POULES`, et étendre `nomPoule(numPoule, poule, nous, competition, numNous)` pour évaluer `COUPES` en fallback avec normalisation sans accents ; vérifier par exécution directe sur les cas unitaires de coupe que chaque compétition retourne le collectif attendu et que les poules de championnat existantes restent inchangées.

## 2. Reconnaissance fiable des équipes et propagation du numéro de club (`data-cleaner.js`, `data-extractor.js`)

- [x] 2.1 Ajouter `CODES_CLUB_DOM` (`6244038`, `6244021`), `'CHAPELAIN'` dans `NOMS_CLUB_DOM`, et exporter `estNotreEquipe(nom, numClub)` dans `js/com-hebdo/data-cleaner.js` ; vérifier que `CHAPELAIN HB-PORTE DE L'ERDRE` (`6244038`) est reconnu tandis que `HANDBALL CLUB DU GESVRES` (`6244085`) sans `ALLIANCE ERDRE ET GESVRES` reste rejeté.
- [x] 2.2 Mettre à jour `js/com-hebdo/data-extractor.js` pour filtrer les lignes à l'import avec `estNotreEquipe` et renseigner `ligne['_numNous']` (numéro de club de notre équipe dans la poule/rencontre) ; vérifier sur les 6 exports `assets/csv/2026-11-23_export-*.csv` que le match `WAGURUB` (SM-1 en CdF) est bien importé et que les équipes propres du HBC Gesvres restent filtrées.

## 3. Gestion des triangulaires et nettoyage des matchs (`data-cleaner.js`, `docs/com-hebdo.md`)

- [x] 3.1 Mettre à jour `DataCleaner.isMatchDom(ligne)` dans `js/com-hebdo/data-cleaner.js` pour donner priorité à `club hote` lorsqu'il est renseigné tout en conservant le statut domicile pour les ententes reçues par HBC Gesvres (`SM-2`, `U19M-2`), et vérifier sur `2026-49` et `2027-01` que les triangulaires au Landreau (`U17F-1`) et à Ancenis (`U19M-1`) passent en extérieur tandis que `SM-2` (Olympie) et `U19M-2` (Coutancière) restent à domicile.
- [x] 3.2 Mettre à jour `DataCleaner.nettoyer(ligne)` et `DataCleaner.nettoyerResultat(ligne)` pour transmettre `competition` et `_numNous` à `nomPoule()`, utiliser `estNotreEquipe()` dans `nomEquipe()` et `derby`, et formater `adversaire` en `<Recevant> vs <Visiteur>` pour les matchs tiers hébergés à domicile lors d'une triangulaire (`Nort AC vs Ligné`, `Savenay Hb vs Montbert-Aigrefeuille`) ; vérifier sur `2027-01` que les matchs neutres hébergés affichent bien les deux équipes adverses et que `TP-F` (sans équipes renseignées) reste intact.
- [x] 3.3 Mettre à jour `docs/com-hebdo.md` pour documenter la résolution des coupes dans `competitions.js`, la reconnaissance par numéro de club et la gestion domicile/extérieur des triangulaires ; vérifier la cohérence avec le code modifié.

## 4. Vérification d'intégration et contrôle visuel

- [x] 4.1 Exécuter le pipeline complet (`CsvParser` → `DataExtractor` → `DataCleaner`) sur l'ensemble des 6 fichiers `assets/csv/2026-11-23_export-{0..5}.csv` et vérifier que tous les matchs de coupe des semaines `2026-42`, `2026-47` et `2027-01` affichent le bon collectif (`SF-1`, `SM-1`, `SF-2`, `SM-2`, `SM-3`, `U13F-1` à `U19M-1`), sans régression sur les autres semaines (championnats, détections, derbies).
- [x] 4.2 Exécuter `make verifier` et `make openspec-verifier`, et proposer une vérification visuelle dans le navigateur (`make servir`) sur les semaines `2026-42`, `2026-47`, `2026-49` et `2027-01`.

## Workflow follow-up

- Créer une branche dédiée (ex. `fix/noms-collectifs-coupes`) avant d'appliquer les modifications de code, puis soumettre une Pull Request vers `main`.
- Archiver le changement OpenSpec (`openspec-archive-change`) une fois l'implémentation validée.
