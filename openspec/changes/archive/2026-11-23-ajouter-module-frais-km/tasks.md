# Tasks

## 1. Barème officiel de l'État et référentiel de distances

- [x] 1.1 Créer `js/frais-km/bareme-etat.js` contenant le barème kilométrique officiel de l'administration fiscale (Voitures `3 CV et moins` à `7 CV et plus`, Motos `1-2 CV`, `3-5 CV`, `> 5 CV`, Cyclomoteur `≤ 50 cm³` et option électrique `+20 %`) ainsi que la fonction de calcul du montant d'abandon de frais et de la réduction d'impôt estimée (66 %).
- [x] 1.2 Créer `js/frais-km/distances-clubs.js` contenant l'adresse par défaut de La Coutancière (`La Coutancière, Allée des Favrières, 44240 La Chapelle-sur-Erdre`), le référentiel géographique des clubs adverses (commune, salle, coordonnées GPS), le géocodage via `api-adresse.data.gouv.fr` et le calcul automatique de la distance routière aller-retour en kilomètres.

## 2. Modèle et générateur Word (`.docx`) d'abandon de frais

- [x] 2.1 Créer le modèle Word `ressources/frais-km/modele-abandon-frais-chapelaine.docx` à partir du modèle officiel du club (conservant l'en-tête et le pied de page officiels de La Chapelaine Handball) avec le tableau des déplacements, les totaux et la déclaration expresse d'abandon de frais conforme à l'article 200 du CGI et au `BOI-IR-RICI-250-20`.
- [x] 2.2 Créer `js/frais-km/generateur-abandon-docx.js` pour injecter les données du bénévole (`Nom`, `Prénom`, `Adresse`, `Immatriculation`, `Véhicule`), la liste des déplacements cochés et les totaux dans le modèle Word et déclencher le téléchargement du fichier `.docx`.

## 3. Interface de l'onglet `Frais km` (`#module-frais-km`)

- [x] 3.1 Mettre à jour `index.html`, `css/style.css` et `js/app.js` pour remplacer l'espace réservé `#module-frais-km` par l'interface complète (formulaire déclarant/véhicule avec adresse par défaut à La Coutancière, sélecteur multi-collectifs, tableau des matchs passés à l'extérieur avec cases à cocher et distances A/R modifiables, récapitulatif et bouton de génération Word).
- [x] 3.2 Créer `js/frais-km/frais-km-app.js` pour charger automatiquement les CSV GestHand par défaut (`assets/csv/2026-11-23_export-*.csv`) et gérer l'import de fichiers supplémentaires, filtrer uniquement les matchs à l'extérieur dans le passé selon les collectifs sélectionnés, recalculer en temps réel les kilomètres et le barème de l'État, et déclencher le téléchargement du document Word.

## 4. Documentation et validation

- [x] 4.1 Mettre à jour la documentation du projet (`README.md`, `AGENTS.md` / `docs/architecture.md`) pour documenter le module `frais-km`.
- [x] 4.2 Vérifier la génération du document Word et le calcul des distances/barèmes sur les CSV du projet, exécuter `make verifier` et `make openspec-verifier`.

## Workflow follow-up

- Archiver la modification OpenSpec (`openspec-archive-change`) après validation par l'utilisateur.
