# Demande initiale historique


Génère un projet dans ce répertoire avec les instructions et les prérequis suivants. Génére attentivement les différents fichiers pour s’assurer que les bonnes pratiques de développement seront suivies. Le projet dois suivre l'approche OpenSpec

# Langue utilisée
La seule langue autorisée dans les fichiers d’instructions, dans les commentaires, dans les noms de variables, etc., est le français. Il est interdit d’utiliser une autre langue dans ce qui est conservé dans les fichiers. Cette instruction est nécessaire pour des raisons de cohérence.

# Utilisation obligatoire d'OpenSpec
Pour tout agent, vérifier avant chaque nouvelle session openspec est utilisé. Toute modification en dehors de ce workflow doit etre expresssement demande et jsutifié par l'utilisateur même en mode auto forcé.

# But du projet
Une petite SPA statique en HTML/CSS/JS, sans backend, sans build, avec plusieurs objectifs :
- Génération des reçus de licences : La première fonctionnalité est un générateur d'attestation de paiement. Il prends en entrée une liste de licencié (modèle de fichier dans ressources/attestation-de-paiement/modele-licencie-adresse.csv), offre à l'utilsiateur le choix d'un modèle (ceux ci sont dans le répertoire ressources/modele-attestation-de-paiement/), pour l'instant un seul modelèe de disponible ressources/modele-attestation-de-paiement/modele-attestation-de-paiement-chapelaine.docx.Les champs suivants sont remplaces : A partir du fichier CSV => [PRENOM], [NOM], [DATE DE NAISSANCE], [ADRESSE COMPELETE]; avec la, [MONTANT LICENSE] east calculé en recherchant l'année de naissance et le sexe dans la date de naissance et en croisant avec ressources/attestation-de-paiement/tarifs.csv
- Gestion des calendriers et de la communication hebdomadaire : importer des CSV GestHand (outil de la Fédération Française de Handball), transformer les données, générer un planning hebdomadaire, puis exporter vers Google Sheets. utiliser le contenu du répertoire /home/pad/projects/chapelaine-com-hebdo (reprends tel quel en faisant le moins de modification possible)
- Génération des fiches de frais kilométriques : sera développé plus tard ; créer une entrée de menue mais une page vide
Gestion de l’assistance des membres : sera développé plus tard ; créer une entrée de menue mais une page vide

Prévoyez que chaque section sera développée par la suite

## Décisions qui en découlent (chiffrées par l’utilisateur)

- Hébergement : GitHub Pages, statique, aucun serveur applicatif.
- JavaScript natif moderne (modules ES), aucun cadriciel.
- Bibliothèques externes uniquement par réseau de diffusion, chargées dynamiquement, aucune copie locale.
- GitHub Issues comme magasin de données : prévu pour l’avenir, pas utilisé par la fonctionnalité actuelle.

# Instructions de départ

Traduit depuis l’anglais ces contraintes suivantes et introduis-les dans un fichier AGENTS.md
Le fichier AGENTS.md doit être tenu strictement à jour.

## Architecture et technologies
- JavaScript natif : modules ES (`import`/`export`), sans assembleur (Webpack, Vite, Rollup) ni transpileur (Babel).
- Aucun serveur applicatif : les traitements restent dans le navigateur. Ne pas ajouter de serveur Node.js, Express ou Python. Les données ne sont pas conservées entre les rechargements, sauf export explicite vers Google Sheets.
- CSS natif : Utilisez du CSS simple avec des propriétés personnalisées (variables) comme dans css/style.css. N’introduisez pas Sass, Less ni Tailwind CSS.
- HTML : Gardez la structure simple et déclarative dans index.html.

## Structure des fichiers & conventions
- Modules JavaScript (js/) :
  - Séparer affichage, extraction (`data-extractor.js`), analyse (`csv-parser.js`) et normalisation (`data-cleaner.js`).
  - `competitions.js` associe les poules aux noms affichés ; `google-config.js` stocke les identifiants publics de configuration Google.
- Scripts autonomes (mail/, matchs/) :
  - Des répertoires comme `mail/` contiennent des scripts de ligne de commande ponctuels, par exemple l’envoi de courriels avec pièces jointes via mutt. Ils restent indépendants de l’application.

## Travailler avec les données CSV GestHand
- L’application ingère les exports CSV GestHand (; séparés, UTF-8).
- Différenciez les “Programmes” (sans scores) et les “Résultats” (avec scores).
- Gardez la logique de nettoyage / normalisation des données dans js/data-cleaner.js.
- Assurez-vous que les changements ne cassent pas l’attribution automatique des tables ni la logique de détection des arbitres.

## Directives générales
- Aucun `package.json` ni dépendance npm ou yarn pour l’application navigateur.
- Lorsque vous modifiez du JavaScript, utilisez une syntaxe ES6+ moderne prise en charge nativement par les navigateurs.
- Respectez les variables CSS existantes (par exemple --orange, --dark, etc.) définies dans :root.

## Contrôle de style et formatage
- Indentation : Utilisez 2 espaces pour l’indentation.
- Guillemets : apostrophes simples pour les chaînes JavaScript, sauf les chaînes à interpolation.
- Points-virgules : Terminez toujours les instructions JavaScript par un point-virgule.

## Makefile

Maintenir un Makefile pour les outils de travail et les étapes OpenSpec.

## Enregistrer les sessions au fur et à mesure
Enregistrez les demandes de toutes les sessions IA dans le répertoire .sessions/. Utilisez le format Markdown.
Stockez le modèle utilisé.
Le nom du fichier doit inclure la date et l’heure, minute de début de la session. L’objectif est de garder une trace des discussions avec l’IA.

## Travail isolé
Utilisez des worktrees pour travailler. Utilisez une revue native pas à pas sans interdire une approche plus agressive si l’utilisateur le demande.

## Documentation
Documenter le projet dans `docs/`, avec liens vers les conceptions et une architecture visuellement exploitable sur GitHub.
Documentez comment développer efficacement dans ce projet.

## Style
Utilise le style dans style.css pour le projet.

# Important
Ajoute les instructions pour toujours demander si les instruciotns de sont pas claires et trop floues.
Toujours propose de faire une experience et de faire une verification visuelle si nécvessaire.
