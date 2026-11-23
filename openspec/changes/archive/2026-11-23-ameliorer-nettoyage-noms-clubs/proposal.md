# Proposal

## Why

Lorsqu'un club adverse n'est pas référencé dans le dictionnaire d'exceptions `CLUBS`, la fonction `DataCleaner.cleanNomEquipe()` laisse passer des préfixes de division sans tiret (`D2m85 E.Poire *Vie Et Yon 2`), des préfixes de division territoriale (`1DTM44C -`), des séparateurs d'entente bruts (`*`, `E.`) et des sigles associatifs ou abréviations de handball (`Hb`, `Hbac`, `Ohb`, `Aaeec`, `Asced`, `Al`, `Cj`, `Csc`, `Es`, `Us`, etc.), ce qui produit des noms peu lisibles dans le Kifekoi, les visuels Instagram et Google Sheets.

## What Changes

- **Suppression élargie des préfixes de compétition GestHand** dans `DataCleaner.cleanNomEquipe()` : prise en charge des codes de division/poule avec ou sans tiret (`D2M85 `, `1DTM44C - `, `HONM62C-`, `HONF62C-`, `U17F44C - `, `U16F62C-`, etc.).
- **Formatage automatique des ententes** : remplacement du séparateur `*` (avec ou sans espaces autour) par ` & ` et suppression du préfixe d'entente `E.` (ex. `D2M85 E.POIRE *VIE ET YON 2` → `Poire & Vie Et Yon 2`, `1DTM44C - ALSEM * ESTUAIRE ET SILLON HB` → `Alsem & Estuaire Et Sillon`).
- **Nettoyage épuré des termes génériques et sigles d'association** : suppression des abréviations et sigles (`HB`, `HC`, `HBAC`, `OHB`, `ASB`, `AAEEC`, `ASCED`, `AL`, `AS`, `CJ`, `CO`, `CSC`, `ES`, `US`, `AC`, `OS`, `NOV`, `Association`, `Sportive`, `Entente`, `Union`) tout en préservant `HBC` en majuscules (`HBC Nantes`, `HBC Pornic`, `HBC Sautron`, etc.).
- **Conservation du numéro d'équipe adverse** (`1`, `2`, `3`, `4`) : suppression des suffixes de catégorie GestHand (`1M.2M`, `1F`, `- U19M`) mais conservation du numéro d'équipe final, aussi bien pour les clubs nettoyés automatiquement que pour les clubs résolus via le dictionnaire `CLUBS` (ex. `ASPTT NANTES 2` → `ASPTT 2`, `PONT-CHATEAU HANDBALL 2` → `Pont-Château 2`).
- **Harmonisation du dictionnaire `CLUBS`** dans `js/com-hebdo/competitions.js` : ajout des variantes présentes dans les exports (`FANS LIGNE` → `Ligné`, `HBC GESVRES` → `HBC Gesvres`).
- **Tri du visuel Résultats par catégorie d'âge** dans `js/com-hebdo/visuel-renderer.js` : classement automatique des résultats des plus jeunes aux plus anciens (`U11` → `U12` → `U13` → `U14` → `U15` → `U16` → `U17` → `U19` → Séniors `SF`/`SM` → Loisirs/Amicales), puis par genre et numéro d'équipe.

## Capabilities

### New Capabilities

### Modified Capabilities
- `com-hebdo/resolution-equipes`: ajout des exigences de nettoyage automatique épuré des noms de clubs adverses et d'ententes inconnus (avec conservation des numéros d'équipe et du sigle `HBC`) et du tri des résultats par catégorie des plus jeunes aux plus anciens.

## Impact

- `js/com-hebdo/data-cleaner.js` (`cleanNomEquipe`)
- `js/com-hebdo/competitions.js` (`CLUBS`, `nomClub`)
- `js/com-hebdo/visuel-renderer.js` (`creerCarteResultats`, tri par catégorie)
- `docs/com-hebdo.md` (sections « Tri et organisation » et « Nettoyage automatique des noms de clubs »)
- `openspec/specs/com-hebdo/resolution-equipes/spec.md`
