# Tasks

## 1. Détection et regroupement des matchs à domicile non conclus

- [x] 1.1 Ajouter dans `js/com-hebdo/data-cleaner.js` la détection d'un match à domicile non conclu (absence de `le`, d'`horaire`, ou `nom salle` vide / contenant `inconnu`, `à définir`, `non défini`, en excluant les lignes sans `club rec` ni `club vis`) ainsi que la liste des champs manquants (`Date`, `Horaire`, `Salle`).
- [x] 1.2 Ajouter dans `js/com-hebdo/data-extractor.js` la méthode `getMatchsDomicileNonConclus(dateRef)` qui filtre les semaines à venir par rapport à la date du jour, regroupe sur une seule ligne les rencontres d'une même triangulaire à domicile (`(semaine, num poule)` identiques avec adversaires concaténés par ` / ` et suffixe `(Triangulaire)`), et calcule le délai en semaines (`delaiSemaines`) ainsi que l'indicateur d'urgence (`urgent: delaiSemaines <= 6`).

## 2. Interface et styles d'alerte dans l'onglet Com Hebdo

- [x] 2.1 Mettre à jour `js/com-hebdo/com-hebdo-app.js` pour afficher et alimenter le panneau d'alerte `#alert-erreurs` après l'import des fichiers CSV, en distinguant les matchs urgents ($\le 6$ semaines, affichés directement en alerte forte) et les matchs en préavis ($> 6$ semaines, regroupés dans un bloc `<details>` repliable), avec un bouton permettant de fermer l'alerte.
- [x] 2.2 Ajouter dans `css/style.css` les styles du panneau d'alerte gradué (`.alert--urgent` avec mise en avant visuelle forte à $\le 6$ semaines, `.alert--preavis`, bouton de fermeture `.alert-close`, tableau compact des matchs non conclus, badges d'échéance et de champs manquants, et bloc `<details>` repliable).

## 3. Documentation et vérification

- [x] 3.1 Documenter la fonctionnalité de détection des matchs à domicile non conclus et l'alerte à 6 semaines dans `docs/com-hebdo.md`.
- [x] 3.2 Vérifier le comportement sur les fichiers CSV du projet (`assets/csv/2026-11-23_export-*.csv`), effectuer une vérification visuelle dans le navigateur, et exécuter `make verifier` ainsi que `openspec validate --all`.

## Workflow follow-up

- Archiver la modification OpenSpec (`openspec-archive-change`) après validation par l'utilisateur.
