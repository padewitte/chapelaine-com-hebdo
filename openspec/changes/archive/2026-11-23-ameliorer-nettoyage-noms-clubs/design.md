# Design

## Context

Voir `proposal.md` pour la motivation. Actuellement, `DataCleaner.cleanNomEquipe(nom)` dans `js/com-hebdo/data-cleaner.js` consulte d'abord `nomClub(nom)` (`js/com-hebdo/competitions.js`), puis applique trois expressions régulières qui ne couvrent que les préfixes suivis d'un tiret (`HAU`, `PRU`, `HON`, `U\d+[MF]`, `D\d+`), les suffixes `1M.2M`, et trois mots génériques (`handball`, `olympique`, `club`).

## Goals / Non-Goals

**Goals:**
- Nettoyer de façon déterministe tous les noms de clubs passés et à venir issus de GestHand sans nécessiter d'intervention manuelle dans `CLUBS` pour chaque nouvel adversaire de coupe ou de championnat.
- Garantir un affichage court et épuré (centré sur le nom de ville/entente) tout en conservant `HBC` et le numéro d'équipe (`1`, `2`, `3`, `4`).

**Non-Goals:**
- Deviner l'accentuation française manquante sur des communes inconnues (seul le dictionnaire `CLUBS` fournit les accents explicites comme `Rezé` ou `Ligné`).

## Decisions

### 1. Pipeline de nettoyage en 4 étapes dans `DataCleaner.cleanNomEquipe`
- **Étape 1 (Préfixes de compétition/division)** :
  - Supprimer les préfixes suivis d'un tiret en ajoutant `\d*DT[MF]\w*` et `D\d+[MF]\w*` (couvre `1DTM44C - `, `HONM62C-`, `U17F44C - `).
  - Supprimer les préfixes de code de compétition suivis d'un espace sans tiret lorsqu'ils comportent un numéro de catégorie ou de département : `/^(?:HAU\d+\w*|PRU\d+\w*|HON[MF]\d+\w*|\d*DT[MF]\d+\w*|D\d+[MF]\d+\w*|U\d+[MF]\d+\w*)\s+/gi` (couvre `D2M85 `).
- **Étape 2 (Ententes `*` et `E.`)** :
  - Supprimer le marqueur d'entente `E.` en début de chaîne ou après un séparateur (`/(?:^|(?<=\*|\s))E\.\s*/gi`).
  - Remplacer `\s*\*\s*` par ` & ` afin d'espacer proprement les ententes même lorsque `*` est collé aux noms (`LA FLECHE*HBC SABLE` → `La Fleche & HBC Sable`, `*VIE ET YON` → ` & Vie Et Yon`).
- **Étape 3 (Suffixes de catégorie vs numéro d'équipe)** :
  - Supprimer les suffixes de catégorie GestHand (`/\s*-\s*U\d+[MF]\b/gi` et `/\s+\d[MFmf](\.\d[MFmf])*/g`), ce qui retire `1M.2M.3M`, `1F` et `- U19M` tout en laissant intacts les numéros d'équipe (`1`, `2`, `3`, `4`).
- **Étape 4 (Épuration des termes génériques et sigles)** :
  - Outre `handball`, `olympique`, `club`, supprimer les mots entiers `hb`, `hc`, `hbac`, `ohb`, `asb`, `aaeec`, `asced`, `al`, `as`, `cj`, `co`, `csc`, `es`, `us`, `ac`, `os`, `nov` ainsi que `association`, `sportive`, `entente`, `union`.
  - Conserver `HBC` et restaurer sa casse en majuscules (`.replace(/\bHbc\b/g, 'HBC')`) après la mise en Title Case.
  - Conserver le filet de sécurité `(court.trim() ? court : complet)` si un nom n'était composé que de mots génériques.

### 2. Conservation du numéro d'équipe dans `nomClub(brut)`
- Dans `js/com-hebdo/competitions.js`, lorsque `nomClub(brut)` trouve une correspondance dans `CLUBS`, extraire un éventuel numéro d'équipe final (après retrait des suffixes `- U\d+[MF]` et `1M.2M`) et l'ajouter au libellé de base s'il n'y figure pas déjà (`ASPTT NANTES 2` → `ASPTT 2`).

### 3. Tri par catégorie d'âge sur le visuel Résultats
- Dans `VisuelRenderer.creerCarteResultats(resultats)` (`js/com-hebdo/visuel-renderer.js`), trier une copie du tableau `resultats` via une fonction `comparerCategorie(a, b)` basée sur `r.poule` :
  - Catégories jeunes `U<âge>` : rang principal = `<âge>` (`11` pour `U11`, `12` pour `U12`, ..., `19` pour `U19`).
  - Catégories séniors `SF-*` / `SM-*` : rang principal = `100` (placées après toutes les catégories jeunes).
  - Autres compétitions (amicales `TP-F` ou poules non mappées) : rang principal = `200`.
  - À rang principal égal, tri secondaire lexicographique naturel (`localeCompare('fr', { numeric: true })`) sur `poule`, ce qui ordonne naturellement `U11F-1`, `U11M-1`, `U11M-2`, `U11M-Porterie` et `SF-1`, `SF-2`, `SM-1`, `SM-2`, `SM-3`, `SM-4`.

## Risks / Trade-offs

- **[Risque] Acronyme court qui coïnciderait avec une syllabe de commune** → Toutes les suppressions utilisent des ancres de mot `\b...\b`, ce qui ne touche jamais l'intérieur d'un mot, et le filet `court.trim() ? court : complet` empêche tout résultat vide.
