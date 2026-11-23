# Design

## Context

Voir `proposal.md` pour le contexte métier et fiscal. Le projet Super Chapelaine est une SPA Vanilla JS (ES Modules) sans backend, hébergée sur GitHub Pages. Le module `attestation` (`js/attestation/generateur-docx.js`) utilise déjà `PizZip`, `Docxtemplater` et `FileSaver` (chargés dynamiquement via CDN) ainsi que le modèle officiel `ressources/modele-attestation-de-paiement/modele-attestation-de-paiement-chapelaine.docx` qui contient les en-têtes et pieds de page officiels de **La Chapelaine Handball**.

## Goals / Non-Goals

**Goals:**
- Permettre à tout bénévole/parent/licencié d'obtenir en quelques clics sa fiche officielle d'abandon de frais kilométriques au format Word (`.docx`) avec l'en-tête officielle du club.
- Charger automatiquement par défaut les exports CSV du club (`assets/csv/2026-11-23_export-*.csv`) tout en acceptant le dépôt de nouveaux fichiers CSV GestHand.
- Filtrer strictement les **matchs à l'extérieur et dans le passé** pour les collectifs sélectionnés.
- Pré-remplir l'adresse de départ sur **La Coutancière (`La Coutancière, Allée des Favrières, 44240 La Chapelle-sur-Erdre`)**, calculer automatiquement la distance routière aller-retour pour chaque déplacement et permettre son ajustement manuel.
- Appliquer le **barème kilométrique officiel de l'État** selon le type et la puissance fiscale du véhicule (avec option électrique `+20 %`).
- Sécuriser juridiquement et fiscalement le club en intégrant toutes les mentions obligatoires de l'**article 200 du CGI** et du **BOFiP `BOI-IR-RICI-250-20`**.

**Non-Goals:**
- Générer directement le reçu fiscal Cerfa n° 11580-04 (qui relève de la comptabilité du trésorier après réception et vérification de la fiche d'abandon de frais signée et de la copie de la carte grise).

## Decisions

### 1. Découpage modulaire dans `js/frais-km/`
Créer quatre modules ES6+ en français dans `js/frais-km/` :
- `js/frais-km/bareme-etat.js` : référentiel et moteur de calcul du barème kilométrique officiel de l'administration fiscale.
- `js/frais-km/distances-clubs.js` : référentiel géographique des clubs adverses (commune, code postal, salle, coordonnées GPS), géocodage de l'adresse de départ via `https://api-adresse.data.gouv.fr/search/` et calcul de la distance routière aller-retour (OSRM / formule routière calibrée avec repli hors-ligne).
- `js/frais-km/generateur-abandon-docx.js` : génération et téléchargement du document Word `.docx` via `PizZip` + `Docxtemplater` + `FileSaver`.
- `js/frais-km/frais-km-app.js` : orchestration de l'interface `#module-frais-km` (chargement CSV auto + drag & drop, sélection des collectifs, tableau des matchs passés à l'extérieur, recalcul temps réel des totaux et déclenchement de l'export Word).

### 2. Extraction des matchs passés à l'extérieur (Résultats + Programmes)
Dans GestHand, les matchs déjà joués figurent dans les fichiers CSV de type **Résultats** (`export-1`, `export-3`, `export-5`) et parfois dans des fichiers **Programme** antérieurs :
- On fusionne les rencontres issues des CSV **Résultats** et **Programme** en dédoublonnant par `code renc`.
- Si une même rencontre (`code renc`) ou un même club recevant (`Num rec`) possède des informations de salle/ville dans un CSV **Programme**, on enrichit l'objet rencontre avec `{ nomSalle, adresseSalle, cp, ville }`.
- Sinon, on résout la commune et les coordonnées GPS du club recevant via le référentiel `CLUBS_GEO` de `distances-clubs.js` (qui couvre tous les clubs adverses des CSV du club : Loire-Atlantique 44, Maine-et-Loire 49, Mayenne 53, Sarthe 72, Vendée 85, Ille-et-Vilaine 35).
- **Critères de filtrage** :
  1. Rencontre concernant l'une de nos équipes (`estNotreEquipe` sur recevant ou visiteur).
  2. **Match à l'extérieur** : `DataCleaner.isMatchDom(ligne) === false` (ou salle d'accueil hors de nos gymnases `Coutancière`, `Jean Jahan`, `Olympie`).
  3. **Match dans le passé** : date `le` renseignée et strictement antérieure à la date du jour (`dateMatch < aujourdhui` à `00:00:00`).
  4. **Match non annulé / forfait** : si la colonne `Etat` est présente (CSV Résultats), exclure les rencontres non jouées à l'avenir tout en gardant les rencontres passées jouées.

### 3. Barème kilométrique officiel de l'État (`bareme-etat.js`)
Le calcul s'effectue sur la **distance totale annuelle $d$** des déplacements cochés, selon les formules officielles de l'administration fiscale :
- **Voitures (`voiture-3cv`, `voiture-4cv`, `voiture-5cv`, `voiture-6cv`, `voiture-7cv`)** :
  - $d \le 5\,000\text{ km}$ : $d \times a_1$
  - $5\,000 < d \le 20\,000\text{ km}$ : $(d \times a_2) + b_2$
  - $d > 20\,000\text{ km}$ : $d \times a_3$
- **Motos > 50 cm³ (`moto-1-2cv`, `moto-3-5cv`, `moto-5cv-plus`) et Cyclomoteurs ≤ 50 cm³ (`cyclo-50`)** :
  - $d \le 3\,000\text{ km}$ : $d \times a_1$
  - $3\,000 < d \le 6\,000\text{ km}$ : $(d \times a_2) + b_2$
  - $d > 6\,000\text{ km}$ : $d \times a_3$
- **Majoration véhicule 100 % électrique** : si `estElectrique === true`, le montant total calculé est multiplié par `1.20`.

### 4. Modèle Word officiel (`ressources/frais-km/modele-abandon-frais-chapelaine.docx`)
Le fichier `.docx` modèle est construit à partir de l'archive de `modele-attestation-de-paiement-chapelaine.docx` afin de conserver à l'identique :
- `word/header1.xml`, `word/header2.xml`, `word/header3.xml` (bandeau et logos officiels La Chapelaine Handball),
- `word/footer1.xml`, `word/footer2.xml`, `word/footer3.xml` (pied de page officiel du club),
- `word/media/*`, `word/styles.xml`, `word/theme/theme1.xml`.

Le corps `word/document.xml` utilise les balises `Docxtemplater` (avec délimiteurs `[` et `]`) :
- Identité et véhicule : `[PRENOM]`, `[NOM]`, `[ADRESSE]`, `[VEHICULE]`, `[IMMATRICULATION]`, `[BAREME_LIBELLE]`, `[SAISON]`.
- Tableau Word récapitulatif des déplacements cochés avec boucle de lignes `[#DEPLACEMENTS]` … `[/DEPLACEMENTS]` :
  - `[DATE]` | `[COLLECTIF]` | `[ADVERSAIRE]` | `[LIEU]` | `[KM_AR] km`
- Totaux : `[NB_DEPLACEMENTS]`, `[TOTAL_KM]`, `[MONTANT_TOTAL]`, `[REDUCTION_IMPOT_ESTIMEE]`.
- Mention légale expresse d'abandon conforme à l'article 200 du CGI et au `BOI-IR-RICI-250-20` (§ 170) + cadres de signature (Bénévole & Visa Trésorier/Président avec rappel de conservation de la copie de la carte grise).

## Risks / Trade-offs

- **[Risque] Indisponibilité réseau des API de géocodage / routage (`api-adresse.data.gouv.fr` / OSRM)** → Le point de départ par défaut (La Coutancière) et toutes les communes des clubs adverses possèdent des coordonnées GPS pré-embarquées dans `distances-clubs.js` permettant un calcul routier instantané sans dépendre du réseau ; en outre, chaque distance A/R reste modifiable manuellement par l'utilisateur dans le tableau.
