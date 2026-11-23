# Proposal

## Why

Dans GestHand, le club recevant doit conclure ses matchs à domicile (saisir la date, l'horaire et la salle) plusieurs semaines à l'avance sous peine d'alerte ou de pénalité fédérale à partir de 6 semaines avant la rencontre. Actuellement, l'onglet Com Hebdo n'affiche que les matchs de la semaine sélectionnée dans la liste déroulante : les matchs à domicile non conclus des semaines suivantes (sans date/horaire ou avec une salle vide / « lieu inconnu ») passent inaperçus jusqu'au moment où l'on sélectionne leur semaine.

## What Changes

- **Détection inter-semaines des matchs à domicile non conclus** dans `DataExtractor` et `DataCleaner` :
  - Parcours de toutes les semaines futures par rapport à la **date du jour** (`getSamediDate(semaine) >= aujourdhui`).
  - Identification des matchs à domicile (`isMatchDom(ligne) === true`) comportant au moins un participant (`club rec` ou `club vis` non vide) et dont la conclusion est incomplète : date (`le`) vide, horaire (`horaire`) vide, ou salle (`nom salle`) vide / indiquant un lieu inconnu (`inconnu`, `à définir`, `non défini`).
- **Regroupement des triangulaires sur une seule ligne** :
  - Fusion des rencontres à domicile non conclues partageant le même couple `(semaine, num poule)` (ex. les 3 matchs d'une triangulaire de coupe départementale hébergée par le club) en une seule ligne affichant le collectif du club et les clubs adverses distincts suivis de la mention `(Triangulaire)`.
- **Calcul du niveau d'alerte à 6 semaines depuis la date du jour** :
  - Calcul de l'écart en semaines entre le samedi de la semaine courante (basé sur la date du jour) et le samedi de la semaine du match.
  - Distinction entre **urgence forte ($\le 6$ semaines)** et **préavis ($> 6$ semaines)**.
- **Affichage d'un panneau d'alerte dans l'onglet Com Hebdo** (sous la zone d'import CSV, au-dessus des onglets `Matchs / Visuel Annonce / Visuel Résultats`) :
  - Mise en évidence visuelle forte (rouge/orangé vif) dès qu'au moins un match à domicile non conclu se trouve à $\le 6$ semaines, avec liste directement visible.
  - Section repliable (`<details>`) pour consulter les matchs à domicile non conclus situés à $> 6$ semaines (ou bandeau ambre discret replié par défaut s'il n'y a aucun match à $\le 6$ semaines).

## Capabilities

### New Capabilities
- `com-hebdo/matchs-non-conclus`: détection, regroupement par triangulaire, calcul d'échéance à 6 semaines par rapport à la date du jour et affichage du panneau d'alerte des matchs à domicile non conclus dans l'onglet Com Hebdo.

### Modified Capabilities

## Impact

- `index.html` (conteneur d'alerte des matchs à domicile non conclus dans `#module-com-hebdo`)
- `css/style.css` (styles du panneau d'alerte critique $\le 6$ semaines et préavis $> 6$ semaines, tableau compact et accordéon)
- `js/com-hebdo/data-cleaner.js` (qualification d'un match à domicile non conclu et diagnostic des champs manquants : Date, Horaire, Salle)
- `js/com-hebdo/data-extractor.js` (extraction et regroupement sur une ligne des triangulaires pour les matchs à domicile non conclus des semaines à venir)
- `js/com-hebdo/com-hebdo-app.js` (calcul du délai par rapport à la date du jour et rendu du panneau d'alerte à chaque import CSV)
- `docs/com-hebdo.md` (documentation de la détection et de l'alerte à 6 semaines)
