# Proposal

## Why

Les bénévoles, parents accompagnateurs, entraîneurs et officiels du club La Chapelaine Handball effectuent tout au long de la saison des déplacements avec leur véhicule personnel pour les matchs à l'extérieur. Conformément à l'article 200 du Code général des impôts (CGI) et au bulletin officiel des finances publiques (`BOI-IR-RICI-250-20`), ils peuvent renoncer expressément au remboursement de leurs frais kilométriques au profit de l'association sous forme de don (ouvrant droit à une réduction d'impôt de 66 % sur justificatif Cerfa n° 11580). Aujourd'hui, l'onglet `Frais km` (`#module-frais-km`) est un simple espace réservé (« Module en cours de développement ») et les bénévoles n'ont aucun outil pour retrouver leurs matchs passés à l'extérieur, calculer leurs distances et le barème officiel de l'État, et générer la déclaration officielle signable avec l'en-tête du club.

## What Changes

- **Activation complète de l'onglet `Frais km` (`#module-frais-km`)** dans `index.html`, `js/app.js` et `js/frais-km/` :
  - Chargement automatique par défaut des fichiers CSV GestHand du club présents dans `assets/csv/2026-11-23_export-*.csv` (Résultats + Programmes), avec possibilité d'importer ou glisser-déposer d'autres fichiers CSV GestHand.
  - Sélection multi-collectifs par puces cliquables triées par catégorie d'âge (`U11` → `U19` → Séniors `SF`/`SM`).
  - Affichage exclusif des **matchs à l'extérieur et dans le passé** (`estDomicile === false` et date antérieure à la date du jour) pour les collectifs sélectionnés.
  - Sélection par cases à cocher des matchs auxquels l'utilisateur a participé.
- **Formulaire du déclarant, du véhicule et barème kilométrique officiel de l'État** :
  - Saisie du **Nom**, **Prénom** et du **numéro d'immatriculation** du véhicule.
  - Saisie de l'**adresse de départ**, pré-remplie par défaut avec l'adresse du gymnase de La Coutancière (`La Coutancière, Allée des Favrières, 44240 La Chapelle-sur-Erdre`).
  - Choix du **type et de la puissance fiscale du véhicule** selon le barème kilométrique officiel de l'administration fiscale (Voitures `3 CV et moins`, `4 CV`, `5 CV`, `6 CV`, `7 CV et plus` ; Motos `1-2 CV`, `3-5 CV`, `> 5 CV` ; Cyclomoteurs `≤ 50 cm³`) + option **Véhicule 100 % électrique (+20 %)**.
- **Calcul automatique et édition des distances Aller-Retour (km)** :
  - Résolution de la commune / salle de chaque club recevant (croisement des CSV Programme et d'un référentiel local des clubs adverses avec coordonnées GPS).
  - Calcul automatique de la distance routière aller-retour depuis l'adresse de départ (avec géocodage via `api-adresse.data.gouv.fr` / routage OSRM lorsque l'adresse est modifiée, et repli déterministe instantané hors-ligne), tout en permettant l'ajustement manuel du kilométrage sur chaque ligne.
- **Génération d'un document Word (`.docx`) officiel d'abandon de frais** :
  - Création d'un modèle Word officiel `ressources/frais-km/modele-abandon-frais-chapelaine.docx` conservant l'en-tête et le pied de page officiels de **La Chapelaine Handball**.
  - Génération côté client via `PizZip` + `Docxtemplater` + `FileSaver` d'un fichier `.docx` contenant l'identité complète, le véhicule et son immatriculation, le tableau détaillé des déplacements cochés, le calcul selon le barème officiel de l'État, la **mention expresse légale de renonciation au remboursement** conforme au `BOI-IR-RICI-250-20` (art. 200 du CGI), et les cadres de signature du bénévole et de visa comptable du club.

## Capabilities

### New Capabilities
- `frais-km/abandon-frais`: sélection des collectifs, filtrage des matchs à l'extérieur passés, calcul des distances aller-retour et du barème kilométrique officiel de l'État par type de véhicule, et génération du document Word (`.docx`) officiel de déclaration et d'abandon de frais kilométriques.

### Modified Capabilities

## Impact

- `index.html` (interface complète du module `#module-frais-km`)
- `css/style.css` (styles du formulaire déclarant/véhicule, des puces de collectifs, du tableau de sélection des déplacements et du récapitulatif fiscal)
- `js/app.js` (initialisation du module `initialiserFraisKm()`)
- `js/frais-km/frais-km-app.js` (logique UI, chargement automatique et manuel des CSV, filtrage collectifs / extérieur / passé, sélection et récapitulatif)
- `js/frais-km/bareme-etat.js` (barème kilométrique officiel de l'État pour voitures, motos, cyclomoteurs et majoration électrique +20 %)
- `js/frais-km/distances-clubs.js` (référentiel des communes/salles et coordonnées des clubs adverses, géocodage `api-adresse.data.gouv.fr` et calcul de distance routière A/R)
- `js/frais-km/generateur-abandon-docx.js` (génération du document Word `.docx` à partir du modèle officiel)
- `ressources/frais-km/modele-abandon-frais-chapelaine.docx` (modèle Word avec en-tête et pied de page officiels La Chapelaine Handball)
- `docs/architecture.md` & `README.md` (mise à jour de la documentation du module `frais-km`)
