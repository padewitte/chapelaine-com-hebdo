# 🏗️ Architecture du projet Super Chapelaine

## Vue d'ensemble

Super Chapelaine est une **application web statique mono-page (SPA)** qui
regroupe plusieurs outils de gestion pour le club de handball La Chapelaine.

L'architecture repose sur des principes simples :
- **Zéro backend** : tout s'exécute côté client dans le navigateur
- **JavaScript vanilla** : ES Modules natifs (`import`/`export`), aucun bundler ni transpileur
- **CSS natif** : variables CSS (`:root`) pour la cohérence visuelle et le thème du club
- **Modularité** : chaque outil est un module autonome et indépendant dans son sous-dossier `js/<module>/`

---

## Architecture des modules

```mermaid
flowchart TD
    ENTREE["index.html<br/>Point d'entrée unique (SPA)"]
    ENTREE --> APP["js/app.js<br/>Routeur & contrôleur principal"]

    APP --> MOD_ATT["Module Attestation<br/>js/attestation/"]
    APP --> MOD_COM["Module Com' hebdo<br/>js/com-hebdo/"]
    APP --> MOD_FRM["Module Frais km 🔜<br/>js/frais-km/"]
    APP --> MOD_ASS["Module Assistance 🔜<br/>js/assistance/"]

    MOD_ATT --> RES_ATT["ressources/attestation-de-paiement/<br/>Tarifs CSV & Modèles DOCX"]
    MOD_COM --> FIXTURES["matchs/<br/>Exports CSV GestHand (tests)"]

    style ENTREE fill:#f96,stroke:#333,color:#fff
    style APP fill:#69b,stroke:#333,color:#fff
    style MOD_ATT fill:#5a5,stroke:#333,color:#fff
    style MOD_COM fill:#5a5,stroke:#333,color:#fff
    style MOD_FRM fill:#999,stroke:#333,color:#fff
    style MOD_ASS fill:#999,stroke:#333,color:#fff
    style RES_ATT fill:#fc5,stroke:#333,color:#333
    style FIXTURES fill:#fc5,stroke:#333,color:#333
```

---

## Flux de données — Attestation de paiement

```mermaid
flowchart LR
    CSV_LIC["CSV licenciés<br/>(GestHand)"]
    CSV_TAR["CSV tarifs"]
    DOCX["Modèle DOCX<br/>attestation"]

    CSV_LIC --> EXTRACT["csv-licencies-parser.js<br/>Extraction & normalisation"]
    CSV_TAR --> CALC["calcul-tarif.js<br/>Calcul cotisation & reste à payer"]
    EXTRACT --> CALC

    CALC --> DOCX_GEN["generateur-docx.js<br/>Remplissage template"]
    DOCX --> DOCX_GEN

    DOCX_GEN --> FICHIER["📄 Attestation<br/>DOCX / PDF"]

    style CSV_LIC fill:#fc5,stroke:#333,color:#333
    style CSV_TAR fill:#fc5,stroke:#333,color:#333
    style DOCX fill:#fc5,stroke:#333,color:#333
    style EXTRACT fill:#69b,stroke:#333,color:#fff
    style CALC fill:#69b,stroke:#333,color:#fff
    style DOCX_GEN fill:#69b,stroke:#333,color:#fff
    style FICHIER fill:#5a5,stroke:#333,color:#fff
```

---

## Flux de données — Communication hebdomadaire (Com' Hebdo)

Le module Com' Hebdo traite les exports GestHand pour générer les plannings (kifekoi), les visuels réseaux sociaux et l'export Google Sheets.

```mermaid
flowchart LR
    CSV_GH["CSV GestHand<br/>(Programmes ou Résultats)"]

    CSV_GH --> PARSER["csv-parser.js<br/>Parsing ; encodage UTF-8"]
    PARSER --> TYPE{Type ?}

    TYPE -->|Programme| EXTRACT["data-extractor.js<br/>Groupement par semaine"]
    TYPE -->|Résultats| VIS_RES["visuel-renderer.js<br/>Visuels scores réseaux"]

    EXTRACT --> CLEAN["data-cleaner.js<br/>Détection dom/ext & salle :<br/>• Coutancière<br/>• Jean Jahan<br/>• Extérieur<br/>• Match non défini"]

    CLEAN --> KIFEKOI["kifekoi-renderer.js<br/>4 onglets HTML :<br/>Coutancière, Jahan,<br/>Extérieur, Non défini"]
    CLEAN --> VIS_ANN["visuel-renderer.js<br/>Visuel Instagram annonces"]
    CLEAN --> GSHEET["google-sheets.js<br/>Export Google Sheets API<br/>(Table, Arbitrage, Anim Indispo)"]

    style CSV_GH fill:#fc5,stroke:#333,color:#333
    style PARSER fill:#69b,stroke:#333,color:#fff
    style TYPE fill:#fff,stroke:#333,color:#333
    style EXTRACT fill:#69b,stroke:#333,color:#fff
    style CLEAN fill:#69b,stroke:#333,color:#fff
    style KIFEKOI fill:#5a5,stroke:#333,color:#fff
    style VIS_ANN fill:#5a5,stroke:#333,color:#fff
    style VIS_RES fill:#5a5,stroke:#333,color:#fff
    style GSHEET fill:#5a5,stroke:#333,color:#fff
```

---

## Structure des répertoires

```
super-chapelaine/
│
├── index.html                  ← SPA : point d'entrée unique (menu modules & conteneurs)
├── Makefile                    ← Commandes du projet (servir, verifier, openspec...)
├── AGENTS.md                   ← Instructions pour les agents IA
├── README.md                   ← Documentation générale
│
├── js/                         ← Code JavaScript (ES Modules natifs)
│   ├── app.js                  ← Point d'entrée & routage inter-modules
│   ├── attestation/            ← Module Attestation de paiement
│   │   ├── attestation-app.js  ← Contrôleur du module attestation
│   │   ├── calcul-tarif.js     ← Calcul et déduction des cotisations
│   │   ├── csv-licencies-parser.js ← Analyse des CSV GestHand licenciés
│   │   └── generateur-docx.js  ← Rendu et export DOCX
│   └── com-hebdo/              ← Module Communication hebdomadaire
│       ├── com-hebdo-app.js    ← Contrôleur du module com' hebdo
│       ├── csv-parser.js       ← Analyse des CSV GestHand (programmes/résultats)
│       ├── data-extractor.js   ← Extraction et groupement par semaine
│       ├── data-cleaner.js     ← Normalisation équipes, détection dom/ext & salle
│       ├── competitions.js     ← Mapping poules & clubs vers libellés d'affichage
│       ├── kifekoi-renderer.js ← Rendu HTML du planning kifekoi (4 onglets)
│       ├── visuel-renderer.js  ← Visuels réseaux sociaux (Instagram)
│       ├── google-sheets.js    ← Export Google Sheets API (couleurs & légendes)
│       └── google-config.js    ← Identifiants OAuth Google (non versionné)
│
├── css/                        ← Styles natifs
│   └── style.css               ← Styles globaux et par module (variables CSS :root)
│
├── ressources/                 ← Données et modèles
│   ├── attestation-de-paiement/← Fichiers de référence pour les attestations
│   └── modele-attestation-de-paiement/
│
├── matchs/                     ← Fichiers CSV d'export GestHand (jeux d'essai)
├── mail/                       ← Scripts utilitaires d'envoi de mail (hors SPA)
├── docs/                       ← Documentation détaillée du projet
│   ├── architecture.md         ← Architecture globale et flux (ce document)
│   ├── com-hebdo.md            ← Guide fonctionnel et technique Com' Hebdo
│   └── developpement.md        ← Guide de développement et contribution
│
├── openspec/                   ← Configuration et spécifications OpenSpec
├── .sessions/                  ← Journaux des sessions IA
└── .github/
    └── copilot-instructions.md
```

---

## Conventions et décisions techniques

### Feuille de styles et variables CSS

Le projet utilise exclusivement `css/style.css`. Les variables CSS sont définies dans `:root` :

| Variable   | Utilisation                         |
|------------|-------------------------------------|
| `--orange` | Couleur principale du club          |
| `--dark`   | Texte et arrière-plans sombres      |
| …          | Voir `css/style.css` pour la liste complète |

### Architecture modulaire JavaScript

- Tout le code JS est découpé par **domaine fonctionnel** sous `js/<nom-module>/`.
- Les modules n'ont pas d'état persistant global : chaque module gère son cycle de vie à travers sa fonction d'initialisation appelée par `js/app.js`.
- Les imports utilisent des chemins relatifs explicites avec l'extension `.js` (`import ... from './module.js'`).

### Données CSV et spécificités GestHand

- **Séparateur** : `;` (point-virgule)
- **Encodage** : `UTF-8`
- **Détection des types** :
  - Présence de la colonne `sc rec` → fichier de **Résultats**
  - Absence de colonne `sc rec` → fichier de **Programmes**
- **Gestion des matchs non confirmés** :
  - Tout match sans date fixée (`le` vide) est orienté vers l'onglet **Match non défini** (`salle: 'non-defini'`).
  - Il se scinde en deux blocs distincts : `Domicile — gymnase à définir` et `Extérieur — à définir`, sans fallback précipité vers un gymnase par défaut.

### Librairies externes

Toute librairie tierce est chargée via CDN dans `index.html` (ex: docx, google api client). Aucune dépendance locale (`node_modules`) ni build step n'est requis.
