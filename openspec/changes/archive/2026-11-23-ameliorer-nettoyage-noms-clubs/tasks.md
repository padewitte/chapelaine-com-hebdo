# Tasks

## 1. Dictionnaire des clubs et conservation du numéro d'équipe

- [x] 1.1 Mettre à jour `CLUBS` et `nomClub(brut)` dans `js/com-hebdo/competitions.js` pour ajouter `FANS LIGNE` (`Ligné`) et `HBC GESVRES` (`HBC Gesvres`) et conserver le numéro d'équipe final (`1`, `2`, `3`, `4`) après retrait des suffixes de catégorie (`1M.2M`, `- U19M`), puis vérifier que `nomClub('ASPTT NANTES 2')` retourne `'ASPTT 2'` et `nomClub('FANS LIGNE')` retourne `'Ligné'`.

## 2. Nettoyage automatique épuré des clubs et ententes

- [x] 2.1 Mettre à jour `DataCleaner.cleanNomEquipe(nom)` dans `js/com-hebdo/data-cleaner.js` pour supprimer les préfixes de compétition/division avec ou sans tiret (`D2M85 `, `1DTM44C - `, `HONM62C-`, `U17F44C - `), normaliser `E.` et `*` en ` & `, supprimer les sigles associatifs et termes génériques tout en préservant `HBC` et le numéro d'équipe final, puis vérifier que `cleanNomEquipe('D2M85 E.POIRE *VIE ET YON 2')` retourne `'Poire & Vie Et Yon 2'`.
- [x] 2.2 Mettre à jour la section « Nettoyage automatique des noms de clubs » dans `docs/com-hebdo.md` et vérifier que la documentation reflète les nouvelles règles de nettoyage.

## 3. Tri des résultats par catégorie et validation

- [x] 3.1 Trier les résultats par catégorie des plus jeunes aux plus anciens (`U11` → `U19` → `SF`/`SM`) dans `VisuelRenderer.creerCarteResultats` (`js/com-hebdo/visuel-renderer.js`) et documenter ce tri dans `docs/com-hebdo.md`.
- [x] 3.2 Valider l'ensemble des noms de clubs et l'ordre des résultats générés sur tous les fichiers CSV passés et à venir (`assets/csv/*.csv` et `matchs/*.csv`) ainsi que `make verifier` et `make openspec-verifier`.

## Workflow follow-up

- Archiver la modification OpenSpec (`openspec-archive-change`) une fois la revue et la vérification visuelle validées.
