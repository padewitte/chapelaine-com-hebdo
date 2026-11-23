# Design

## Context

Voir `proposal.md` pour la motivation et le périmètre fonctionnel.

Dans l'implémentation actuelle du module `com-hebdo` (JavaScript vanilla ES Modules, sans build ni dépendance externe) :
- `js/com-hebdo/competitions.js` résout uniquement `POULES[numPoule]` puis retombe sur le champ brut `poule`.
- `js/com-hebdo/data-extractor.js` filtre les lignes uniquement par correspondance textuelle (`estNotreClub`) et calcule `ligne['_nous']` (nom texte de notre équipe dans la poule).
- `js/com-hebdo/data-cleaner.js` détermine le statut domicile via `hote || rec` et suppose que chaque ligne impliquant notre club fait jouer notre équipe.

L'analyse des exports `assets/csv/2026-11-23_export-{0..5}.csv` et `matchs/2026-09-18_Export_GH-competition (1).csv` montre que les codes `num poule` de coupe sont éphémères (nouveau code à chaque tour et par triangulaire, voire renommage en cours de saison), alors que les champs `competition` et `Num rec` / `Num vis` sont stables et structurés.

## Goals / Non-Goals

**Goals:**
- Résoudre automatiquement tous les tours présents et futurs des coupes (Coupe de France, Coupe Pays de la Loire, Coupes Jeunes 44) sans maintenance manuelle à chaque tirage au sort.
- Conserver les libellés existants des collectifs (`SF-1`, `SM-1`, `SM-2`, `SM-3`, `SF-2`, `U13F-1`…`U19M-1`) pour une compatibilité transparente avec le kifekoi, les visuels et l'export Google Sheets (y compris la détection `< U19`).
- Garantir la non-régression sur tous les championnats, derbies, détections et matchs d'entente (Porterie, Alliance Erdre et Gesvres / HBC Gesvres).

**Non-Goals:**
- Ne pas modifier la structure visuelle ou les colonnes du kifekoi, des visuels ou de l'export Google Sheets.
- Ne pas traiter les tournois École de Hand (hors périmètre de cette demande).
- Ne pas ajouter d'interface de configuration dynamique des compétitions.

## Decisions

### 1. Règles déclaratives `COUPES` sur `competition` plutôt que sur préfixe `num poule`
- **Choix** : ajouter une table ordonnée `COUPES` dans `js/com-hebdo/competitions.js` évaluée en fallback quand `POULES[numPoule]` n'a pas de correspondance. Chaque règle porte une expression régulière testée sur la colonne `competition` normalisée (minuscules, sans accents via `normalize('NFD')`), associée soit à un `nom` fixe, soit à un objet `parClub` indexé par numéro de club (`6244038`, `6244021`, `6244085`) avec éventuel repli textuel sur `_nous`.
- **Pourquoi** :
  - Les préfixes `num poule` ne suffisent pas toujours à distinguer le niveau : en Coupe Pays de la Loire masculine, la départementale (`M62001000U`) et la régionale (`M62001001U`) partagent le même préfixe `M620010`.
  - La colonne `competition` est lisible pour un humain, stable entre les tours et résiste à l'ajout d'un sponsor (ex. `coupe de france caisse d'epargne regionale feminine 2026-2027` matche `/coupe.*regionale.*feminine/i`).
- **Alternative écartée** : lister chaque `num poule` dans `POULES` → fragile car chaque tour et chaque triangulaire génère un nouveau code.

### 2. Extraction du numéro de club (`_numNous`) et identification par code club pour La Chapelaine et Porterie
- **Choix** :
  - Définir `CODES_CLUB_DOM = ['6244038', '6244021']` (La Chapelaine et Porterie) dans `data-cleaner.js` et ajouter `'CHAPELAIN'` à `NOMS_CLUB_DOM` comme filet de sécurité.
  - Exposer un prédicat `estNotreEquipe(nom, numClub)` vérifiant `CODES_CLUB_DOM.includes(numClub) || estNotreClub(nom)`.
  - Ne **pas** inclure `6244085` (HBC Gesvres) dans `CODES_CLUB_DOM`, car les exports du HBC Gesvres contiennent ses équipes propres hors entente ; ses équipes en entente continuent d'être reconnues via `'ALLIANCE ERDRE ET GESVRES'` dans le nom.
  - Dans `data-extractor.js`, associer à chaque ligne `_numNous` (numéro de club correspondant à l'équipe retenue pour la poule ou directement issu de `Num rec`/`Num vis` de la rencontre) et le transmettre à `nomPoule(numPoule, poule, nous, competition, numNous)`.
- **Pourquoi** : résout définitivement les fautes de frappe GestHand (`CHAPELAIN HB-PORTE DE L'ERDRE`) et fiabilise la désambiguïsation en coupe départementale (`6244021` → `SM-3`, `6244085` → `SM-2`) même quand le libellé texte varie (`ENT ALLIANCE ERDRE ET GESVRES` vs `HBC GESVRES*ALLIANCE ERDRE ET GESVRES`).

### 3. Priorité de `club hote` pour `isMatchDom` avec prise en compte de l'entente HBC Gesvres
- **Choix** : dans `DataCleaner.isMatchDom(ligne)` :
  1. Si `club hote` est renseigné :
     - Retourner `true` si `estNotreClub(hote)`.
     - Retourner `true` si l'équipe recevante est une de nos équipes d'entente avec Gesvres (`estNotreEquipe(rec, numRec)` et `hote` contient `GESVRES` et `rec` contient `GESVRES`).
     - Retourner `false` sinon (ex. triangulaire hébergée chez un club tiers comme Le Landreau ou Ancenis).
  2. Si `club hote` est vide (fichiers de résultats) : retourner `estNotreEquipe(rec, numRec)`.
- **Pourquoi** : corrige les triangulaires à l'extérieur où notre équipe apparaît en `club rec` sans casser les matchs à domicile de `SM-2` et `U19M-2` reçus par `HANDBALL CLUB DU GESVRES` (Salle Olympie ou Coutancière).

### 4. Formatage des matchs tiers hébergés lors d'une triangulaire à domicile
- **Choix** : dans `DataCleaner.nettoyer(ligne)`, détecter le cas `estMatchTiersHeberge` : `club rec` et `club vis` sont tous deux non vides, aucun des deux ne correspond à `estNotreEquipe(...)`, et `estDomicile` est `true`. Dans ce cas :
  - `poule` reste le nom du collectif hôte de la triangulaire (`U14M-1`, `U16M-1`), préservant le tri, l'attribution automatique de table de marque et la détection `< U19` dans Google Sheets.
  - `adversaire` est formaté en `${cleanNomEquipe(rec)} vs ${cleanNomEquipe(vis)}` (ex. `Nort Ac vs Ligné`).
- **Alternative écartée** : filtrer/supprimer ces rencontres à l'import → ferait disparaître du kifekoi des matchs réellement joués dans notre gymnase qui nécessitent un créneau et une table de marque.

## Risks / Trade-offs

- **Évolution d'un intitulé de compétition GestHand** → Mitigation : les motifs `COUPES` sont volontairement tolérants (normalisation sans accents, expressions régulières souples autour des mots-clés stables `coupe`, niveau, sexe/catégorie) et centralisés dans `competitions.js`.
- **Deux équipes du même club engagées dans une même coupe jeune ou départementale** (ex. si `SM-3` et `SM-4` étaient un jour toutes deux inscrites en CdF départementale sous le même code `6244021`) → Mitigation : le mécanisme `parClub` peut être combiné avec un repli/surcharge par fragment du nom d'équipe (`_nous`) ou une entrée exacte dans `POULES` qui reste prioritaire.
- **Un match neutre hébergé en triangulaire qui apparaîtrait dans le visuel Instagram "Annonce"** → Mitigation : l'affichage `<Collectif> | <Horaire> | <Club A vs Club B>` reste compréhensible et évite surtout le doublon mensonger `<Collectif> vs <Club B>` présent aujourd'hui.
