# Chapelaine Com Hebdo

Application web qui génère le planning hebdomadaire des matchs (**kifekoi**) à partir d'un export CSV issu de [**GestHand**](https://gesthand.net), le logiciel fédéral de gestion du handball.

Vanilla JS (ES Modules), aucun build, aucun back-end. Tout tourne dans le navigateur — les données sont perdues à la fermeture/au rechargement de la page (sauf export Google Sheets).

---

## Import des données

### Source
Les fichiers CSV proviennent de l'export [GestHand](https://gesthand.net) du club. Séparateur `;`, encodage `UTF-8` (avec BOM). *Avant le piratage de GestHand cet été, l'export était en `ISO-8859-1` — l'encodage a changé depuis.*

### Deux types de fichiers
| Type | Contenu | Détection |
|------|---------|-----------|
| **Programme** | Matchs à venir (pas de score) | Absence de colonne `sc rec` dans le CSV |
| **Résultat** | Matchs joués (avec scores) | Présence de colonne `sc rec` dans le CSV |

Seuls les fichiers de type **programme** alimentent le kifekoi.

### Comment importer
- Glisser-déposer un ou plusieurs fichiers CSV sur la zone de dépôt, ou cliquer pour ouvrir le sélecteur de fichier
- Plusieurs fichiers peuvent être chargés simultanément — les données sont fusionnées
- Après l'import, le sélecteur de semaine se peuple avec toutes les semaines présentes (format GestHand `YYYY-SS`, ex: `2025-19`) ; la semaine passée la plus proche est sélectionnée automatiquement

---

## Structure du kifekoi

### Cinq onglets
| Onglet | Contenu |
|--------|---------|
| **Coutancière** | Matchs à domicile joués à La Coutancière |
| **Jean Jahan** | Matchs à domicile joués à la salle Jean Jahan |
| **Olympie** | Matchs à domicile joués à la salle Olympie (Treillières, Alliance Erdre et Gesvres) |
| **Extérieur** | Matchs à l'extérieur dont la date est connue |
| **Match non défini** | Matchs (domicile ou extérieur) dont la date n'est pas encore fixée |

### Détection domicile / salle
Les équipes du club sont reconnues à la fois par leurs **numéros fédéraux** (`6244038` La Chapelaine, `6244021` Porterie) et par leurs noms connus (liste modifiable dans `js/com-hebdo/data-cleaner.js`) :
```
CHAPELAINE, CHAPELAIN, LA CHAPELAINE, PORTERIE HB, PORTERIE, ST JOSEPH PORTERIE, ALLIANCE ERDRE ET GESVRES
```

À l'import, seules les rencontres impliquant l'une de nos équipes (en `club rec` / `Num rec`, `club vis` / `Num vis`) ou hébergées par notre club (`club hote`) sont gardées : l'export d'un club partenaire (ex. HBC Gesvres `6244085` pour l'Alliance Erdre et Gesvres) peut ainsi être chargé tel quel sans embarquer ses équipes propres.

Le statut **domicile** (`isMatchDom` dans `data-cleaner.js`) donne priorité à `club hote` lorsqu'il est renseigné :
- `club hote` appartient à notre club → **Domicile**
- `club hote` est `HANDBALL CLUB DU GESVRES` et l'équipe recevante est une de nos ententes avec Gesvres (`SM-2`, `U19M-2`) → **Domicile**
- `club hote` est un autre club tiers (ex. triangulaire de coupe jouée chez un club adverse) → **Extérieur**
- `club hote` est vide (fichiers de résultats) → **Domicile** si l'équipe recevante est l'une de nos équipes

Lors d'une triangulaire hébergée dans l'un de nos gymnases, les matchs opposant deux clubs adverses sont conservés avec le collectif hôte et affichent `<Recevant> vs <Visiteur>` en colonne Adversaire.

La salle (`detecterSalle` dans `data-cleaner.js`) se décide dans cet ordre :
1. Champ `le` (date) vide → **Match non défini**, quel que soit le statut domicile/extérieur
2. Match à l'extérieur (date connue) → **Extérieur**
3. Match à domicile, `nom salle` contient `JAHAN` → **Jean Jahan**
4. Match à domicile, `nom salle` contient `OLYMPIE` → **Olympie**
5. Match à domicile, `nom salle` renseigné et ne contenant ni `COUTANCIERE`, ni `JAHAN`, ni `OLYMPIE` (entente reçue dans un autre gymnase du club partenaire) → **Extérieur**
6. Match à domicile, sinon → **Coutancière**

Tant que la date n'est pas fixée, on ne sait rien de fiable sur la salle réelle : plutôt que de deviner (et risquer d'afficher une fausse information, par exemple notre propre club comme "Club hôte" d'un match extérieur), le match part dans la zone neutre **Match non défini**, qui se scinde elle-même en deux blocs : **Domicile — gymnase à définir** et **Extérieur — à définir** (même logique dans le kifekoi et dans l'export Google Sheets).

---

## Colonnes du tableau

### Matchs domicile (Coutancière / Jean Jahan / Olympie / bloc "Domicile" de Match non défini)
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
| **Anim Indispo** | — | Colonne vide à remplir manuellement |

### Matchs extérieur (Extérieur / bloc "Extérieur" de Match non défini)
| Colonne | Source |
|---------|--------|
| **Horaire** | Champ `horaire` du CSV |
| **Club hôte** | Champ `club hote` (nom nettoyé) |
| **Équipe** | Nom mappé via `competitions.js` |
| **Gymnase** | Champ `nom salle` |

---

## Règles automatiques

### Table de marque
La colonne **Table** est pré-remplie automatiquement, appliquée par salle et par jour :

> L'équipe qui fait la table est celle qui joue le match **suivant** sur le même terrain.

Cas particuliers :
- **Dernier match du créneau** → c'est l'équipe du match **précédent** qui fait la table
- **Écart de plus de 3h** entre deux matchs → cellule laissée vide (créneau trop espacé)

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

Le badge **D** indique une désignation officielle fédérale, à distinguer d'un arbitre bénévole du club. Dans l'export Google Sheets, la cellule Arbitrage est mise en **fond bleu clair** lorsqu'un arbitre désigné est présent.

---

## Tri et organisation

- Les blocs sont triés **par date calendaire** (samedi avant dimanche), les matchs dans un bloc **par horaire croissant**
- Les résultats (onglet **Visuel Résultats**) sont triés **par catégorie des plus jeunes aux plus anciens** (`U11` à `U19`, puis Séniors `SF` et `SM`)
- Les matchs amicaux ne sont pas affichés
- Les matchs sans date encore fixée (voir [Match non défini](#structure-du-kifekoi)) sont triés par nom de poule

---

## Export Google Sheets

### Accès
Le bouton **"Exporter vers Google Sheets"** apparaît dans l'onglet Matchs après chargement d'un CSV. Il déclenche une authentification Google (pop-up OAuth) puis écrit les données dans le spreadsheet configuré.

### Configuration
Le fichier **`js/com-hebdo/google-config.js`** contient les identifiants Google :
```js
export const GOOGLE_CONFIG = {
  clientId:      'VOTRE_CLIENT_ID.apps.googleusercontent.com',
  spreadsheetId: 'VOTRE_SPREADSHEET_ID',
  scope:         'https://www.googleapis.com/auth/spreadsheets',
};
```

### Structure de la feuille exportée
Une feuille est créée (ou mise à jour) par semaine, nommée automatiquement : **`S19 — 10/5 & 11/5`**.

```
COUTANCIÈRE
  samedi 26 avril 2025
  Horaire | Équipe | Adversaire | Table | Arbitrage | Arb. backup | Suivi | Resp. Salle | Animation | Anim Indispo
  14h00   | U14-M D8 | Pornic  | U11-M D4 | ...
  (ligne vide)
  dimanche 27 avril 2025
  ...
(2 lignes vides)
JEAN JAHAN
  ...
(2 lignes vides)
OLYMPIE
  ...
(2 lignes vides)
EXTÉRIEUR
  ...
(2 lignes vides)
MATCH NON DÉFINI
  Domicile — gymnase à définir
  Horaire | Équipe | Adversaire | Table | ...
  ...
  Extérieur — à définir
  Horaire | Club hôte | Équipe | Gymnase
  ...
```

### Code couleur dans Sheets
| Couleur | Colonne | Signification |
|---------|---------|---------------|
| 🔵 Bleu clair | Arbitrage | Arbitre officiellement désigné par la fédération `(D)` |
| 🟡 Jaune pâle | Table + Arbitrage | Catégorie mineure (< U19) — suivi d'un tuteur requis |

Une **légende** reprenant ce code couleur est automatiquement ajoutée en haut du document.

### Prérequis
- Projet Google Cloud avec l'**API Google Sheets activée**
- Identifiants OAuth2 de type "Application Web" avec `http://127.0.0.1:5500` en origine autorisée
- Le spreadsheet doit être accessible depuis le compte Google utilisé pour l'authentification

---

## Noms des équipes, clubs et compétitions

Le fichier **`js/com-hebdo/competitions.js`** est le seul endroit à modifier pour personnaliser les noms affichés.

### Ajouter une nouvelle compétition
1. Ouvrir `js/com-hebdo/competitions.js`
2. Pour un **championnat** ou tournoi de détection : repérer la valeur exacte du champ `num poule` dans le CSV GestHand et l'ajouter dans `POULES`
3. Pour une **coupe** (dont le `num poule` change à chaque tour ou triangulaire) : ajouter ou ajuster une règle dans `COUPES` sur la colonne `competition` (avec désambiguïsation `parClub` / `parNom` si plusieurs collectifs y participent)
4. Enregistrer — le nom s'affiche immédiatement au prochain import

Si une poule n'est listée ni dans `POULES` ni dans `COUPES`, la valeur brute du champ `poule` du CSV s'affiche telle quelle — rien ne plante.

### Nettoyage automatique des noms de clubs
Les noms de clubs adverses et hôtes (colonnes Adversaire et Club hôte) sont nettoyés automatiquement (`js/com-hebdo/data-cleaner.js`) :
- Suppression des préfixes de compétition et de division GestHand, avec ou sans tiret (`U12M-44-EXC-C-`, `1DTM44C - `, `D2M85 `, `HONM62C-`…)
- Normalisation des ententes : remplacement du séparateur `*` par ` & ` et suppression du préfixe `E.` (`D2M85 E.POIRE *VIE ET YON 2` → `Poire & Vie Et Yon 2`)
- Suppression des suffixes de catégorie (`1M.2M`, `1F`, `- U19M`…) tout en conservant le numéro d'équipe final (`1`, `2`, `3`, `4`)
- Suppression des mots génériques et sigles d'association (`Handball`, `Olympique`, `Club`, `Association`, `Sportive`, `Entente`, `Union`, `HB`, `HC`, `HBAC`, `OHB`, `AAEEC`, `ASCED`, `AL`, `AS`, `CJ`, `CO`, `CSC`, `ES`, `US`, `AC`, `OS`, `NOV`…) tout en préservant l'acronyme `HBC`
- Mise en forme en majuscule initiale
- Les cas particuliers (accents spécifiques ou surnoms) se règlent dans le tableau `CLUBS` de `competitions.js` (qui conserve lui aussi le numéro d'équipe final)
