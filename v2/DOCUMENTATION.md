# Chapelaine Com Hebdo — Documentation

## Vue d'ensemble

Application web permettant de générer le planning hebdomadaire des matchs (**kifekoi**) à partir d'un export CSV issu de **GestHand**, le logiciel fédéral de gestion du handball.

Aucun serveur requis côté back-end. Toutes les données restent en mémoire dans le navigateur — elles sont perdues à la fermeture ou au rechargement de la page.

---

## Import des données

### Source
Les fichiers CSV proviennent de l'export GestHand du club. Le séparateur est `;` et l'encodage est `ISO-8859-1` (latin-1).

### Deux types de fichiers
| Type | Contenu | Détection |
|------|---------|-----------|
| **Programme** | Matchs à venir (pas de score) | Absence de colonne `sc rec` dans le CSV |
| **Résultat** | Matchs joués (avec scores) | Présence de colonne `sc rec` dans le CSV |

Seuls les fichiers de type **programme** alimentent le kifekoi.

### Comment importer
- Glisser-déposer un ou plusieurs fichiers CSV sur la zone de dépôt
- Ou cliquer sur la zone pour ouvrir le sélecteur de fichier
- Plusieurs fichiers peuvent être chargés simultanément — les données sont fusionnées

### Sélection de la semaine
Après l'import, le sélecteur se peuple avec toutes les semaines présentes dans les fichiers. La première semaine est sélectionnée automatiquement. La semaine GestHand est au format `YYYY-SS` (ex: `2025-19`).

---

## Structure du kifekoi

### Trois onglets
| Onglet | Contenu |
|--------|---------|
| **Coutancière** | Matchs joués à La Coutancière |
| **Jean Jahan** | Matchs joués à la salle Jean Jahan |
| **Extérieur** | Matchs joués dans une salle adverse |

La détection de la salle se fait sur le champ `nom salle` du CSV :
- Contient `COUTANCIERE` → onglet Coutancière
- Contient `JAHAN` → onglet Jean Jahan
- Sinon → onglet Extérieur

### Détection des matchs à domicile
Un match est considéré à domicile si le champ `club hote` **ou** `club rec` contient l'un des noms connus du club :
```
CHAPELAINE, LA CHAPELAINE, PORTERIE HB, PORTERIE, ST JOSEPH PORTERIE
```
*(liste modifiable dans `js/data-cleaner.js`)*

---

## Colonnes du tableau

### Matchs domicile (Coutancière / Jean Jahan)
| Colonne | Source | Règle |
|---------|--------|-------|
| **Horaire** | Champ `horaire` du CSV | Formaté `10h00` |
| **Équipe** | Champs `competition` + `poule` | Nom mappé via `competitions.js` |
| **Adversaire** | Champ `club vis` | Nom nettoyé |
| **Table** | Calculé automatiquement | Voir règle ci-dessous |
| **Arbitrage** | Champs `arb1 designe` / `arb2 designe` | Voir règle ci-dessous |
| **Arb. backup** | — | Colonne vide à remplir manuellement |
| **Suivi** | — | Colonne vide à remplir manuellement |
| **Resp. Salle** | — | Colonne vide à remplir manuellement |
| **Animation** | — | Colonne vide à remplir manuellement |

### Matchs extérieur
| Colonne | Source |
|---------|--------|
| **Horaire** | Champ `horaire` du CSV |
| **Club hôte** | Champ `club hote` (nom nettoyé) |
| **Équipe** | Nom mappé via `competitions.js` |
| **Gymnase** | Champ `nom salle` |

---

## Règles automatiques

### Table de marque
La colonne **Table** est pré-remplie automatiquement selon la règle suivante, appliquée par salle et par jour :

> L'équipe qui fait la table est celle qui joue le match **suivant** sur le même terrain.

Cas particuliers :
- **Dernier match du créneau** → c'est l'équipe du match **précédent** qui fait la table
- **Écart de plus de 3h** entre deux matchs → cellule laissée vide (créneau trop espacé pour appliquer la règle)

Exemple typique (les Séniors jouent toujours en dernier) :
| Horaire | Équipe | Table |
|---------|--------|-------|
| 10h00 | U11-M D4 | U14-M D8 *(suivant, écart 1h30)* |
| 11h30 | U14-M D8 | U16-M D3 *(suivant, écart 1h)* |
| 12h30 | U16-M D3 | SM-1 *(suivant, écart 2h)* |
| 14h30 | SM-1 | U16-M D3 *(précédent, car toujours dernier)* |

### Arbitres désignés
La colonne **Arbitrage** est pré-remplie si GestHand a désigné des arbitres officiels (champs `arb1 designe` / `arb2 designe`) :

- **Aucun désigné** → cellule vide `—`
- **Un arbitre** → `Nom Arbitre D`
- **Deux arbitres** → `Arbitre1 D / Arbitre2 D`

Le badge **D** indique qu'il s'agit d'une désignation officielle fédérale, à distinguer d'un arbitre bénévole du club.

Dans l'export Google Sheets, la cellule Arbitrage est mise en **fond bleu clair** lorsqu'un arbitre désigné est présent.

---

---

## Export Google Sheets

### Accès
Le bouton **"Exporter vers Google Sheets"** apparaît dans l'onglet Matchs après chargement d'un CSV. Il déclenche une authentification Google (pop-up OAuth) puis écrit les données dans le spreadsheet configuré.

### Configuration
Le fichier **`js/google-config.js`** contient les identifiants Google (non versionné) :
```js
export const GOOGLE_CONFIG = {
  clientId:      'VOTRE_CLIENT_ID.apps.googleusercontent.com',
  spreadsheetId: 'VOTRE_SPREADSHEET_ID',
  scope:         'https://www.googleapis.com/auth/spreadsheets',
};
```

### Structure de la feuille exportée
Une feuille est créée (ou mise à jour) par semaine, nommée automatiquement : **`S19 — 10/5 & 11/5`**

Pour chaque gymnase (Coutancière, Jean Jahan, Extérieur), le planning est structuré ainsi :
```
COUTANCIÈRE
  samedi 26 avril 2025
  Horaire | Équipe | Adversaire | Table | Arbitrage | Arb. backup | Suivi | Resp. Salle | Animation
  14h00   | U14-M D8 | Pornic  | U11-M D4 | ...
  (ligne vide)
  dimanche 27 avril 2025
  ...
(2 lignes vides)
JEAN JAHAN
  ...
```

### Code couleur dans Sheets
| Couleur | Colonne | Signification |
|---------|---------|---------------|
| 🔵 Bleu clair | Arbitrage | Arbitre officiellement désigné par la fédération `(D)` |
| 🟡 Jaune pâle | Table + Arbitrage | Catégorie mineure (< U19) — suivi d'un tuteur requis |

Une **légende** reprenant ce code couleur est automatiquement ajoutée en bas du document.

### Prérequis
- Projet Google Cloud avec l'**API Google Sheets activée**
- Identifiants OAuth2 de type "Application Web" avec `http://127.0.0.1:5500` en origine autorisée
- Le spreadsheet doit être accessible depuis le compte Google utilisé pour l'authentification

---

## Noms des équipes et compétitions

### Fichier de configuration
Le fichier **`js/competitions.js`** est le seul endroit à modifier pour personnaliser les noms affichés.

Il contient un tableau `POULES` qui associe la valeur exacte du champ `poule` du CSV au nom voulu :

```js
export const POULES = {
  'U14M D8':  'U14-M D8',
  'U13F D3':  'U13-F D3',
  // ...
};
```

Si une poule n'est pas listée, la valeur brute du CSV s'affiche telle quelle — rien ne plante.

### Nettoyage automatique des noms de clubs
Les noms de clubs adverses (colonne Adversaire) sont nettoyés automatiquement :
- Suppression des suffixes GestHand (`1M.2M`, `1F.2F`…)
- Suppression des mots génériques (`Handball`, `Olympique`, `Club`…)
- Mise en forme en majuscule initiale

---

## Tri et organisation

- Les blocs sont triés **par date calendaire** (samedi avant dimanche)
- Les matchs dans un bloc sont triés **par horaire croissant**
- Les matchs amicaux ne sont pas affichés

---

## Architecture des fichiers

```
v2/
├── index.html                 — Structure HTML de la page
├── css/
│   └── style.css              — Styles (CSS natif imbriqué)
├── assets/
│   └── img/                   — Logos des clubs
└── js/
    ├── app.js                 — Point d'entrée, gestion des onglets et du sélecteur
    ├── csv-parser.js          — Lecture et parsing des fichiers CSV
    ├── data-extractor.js      — Stockage et regroupement par semaine
    ├── data-cleaner.js        — Nettoyage et normalisation des données
    ├── kifekoi-renderer.js    — Génération du HTML des tableaux kifekoi
    ├── visuel-renderer.js     — Génération des visuels Instagram (annonce + résultats)
    ├── google-sheets.js       — Export et mise en forme Google Sheets
    ├── google-config.js       — ⭐ Identifiants Google (non versionné)
    └── competitions.js        — ⭐ Mapping poule → nom affiché (à maintenir)
```

---

## Ajouter une nouvelle compétition

1. Ouvrir `js/competitions.js`
2. Repérer la valeur exacte du champ `poule` dans le CSV GestHand
3. Ajouter une ligne dans le tableau `POULES` :
   ```js
   'U17M D2':  'U17-M D2',
   ```
4. Enregistrer — le nom s'affiche immédiatement au prochain import
