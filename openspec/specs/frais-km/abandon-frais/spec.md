# frais-km/abandon-frais Specification

## Purpose

Cette capacité définit le module de gestion des déplacements et de génération des déclarations d'abandon de frais kilométriques des bénévoles (`#module-frais-km`), incluant le pré-chargement des exports CSV GestHand du club, la sélection multi-collectifs, le filtrage exclusif des matchs passés à l'extérieur, le calcul des distances aller-retour depuis l'adresse de départ (La Coutancière par défaut), l'application du barème kilométrique officiel de l'État par type de véhicule et la génération d'un document Word (`.docx`) officiel conforme à l'article 200 du CGI et au `BOI-IR-RICI-250-20`.

## Requirements

### Requirement: Chargement des matchs et sélection multi-collectifs dans l'onglet des déplacements
Dans l'onglet des déplacements (`#module-frais-km`), le système SHALL charger automatiquement par défaut les fichiers CSV GestHand du club présents dans `assets/csv/` (tout en permettant l'import manuel de fichiers CSV supplémentaires) et proposer un sélecteur multi-collectifs ordonné des catégories les plus jeunes aux plus anciennes (`U11` à `U19`, puis `SF` et `SM`).

#### Scenario: Chargement automatique des exports du club et affichage des collectifs
- **WHEN** l'utilisateur ouvre l'onglet des déplacements (`Frais km`)
- **THEN** les fichiers CSV par défaut du club sont chargés et tous les collectifs ayant des matchs sont proposés sous forme de puces sélectionnables triées par catégorie d'âge croissante

#### Scenario: Sélection d'un ou plusieurs collectifs
- **WHEN** l'utilisateur clique sur un ou plusieurs collectifs (par exemple `U14M-1` et `SM-1`)
- **THEN** la liste des déplacements affichée est filtrée pour ne présenter que les matchs de ces collectifs

### Requirement: Filtrage exclusif des matchs à l'extérieur et dans le passé avec sélection des participations
Le système SHALL afficher uniquement les rencontres jouées à l'extérieur (`estDomicile === false`) et dont la date est strictement antérieure à la date du jour, et permettre à l'utilisateur de cocher les rencontres auxquelles il a participé.

#### Scenario: Exclusion des matchs à domicile et des matchs futurs
- **WHEN** les fichiers CSV contiennent des matchs à domicile, des matchs à venir et des matchs passés à l'extérieur pour le collectif sélectionné
- **THEN** seuls les matchs à l'extérieur dont la date est dans le passé sont affichés dans le tableau de sélection

#### Scenario: Sélection des déplacements effectués
- **WHEN** l'utilisateur coche ou décoche un ou plusieurs matchs passés à l'extérieur dans la liste
- **THEN** le total des kilomètres aller-retour et le montant total de l'abandon de frais sont recalculés immédiatement à partir des seuls matchs cochés

### Requirement: Saisie de l'adresse de départ avec La Coutancière par défaut et calcul des distances aller-retour
Le système SHALL proposer un champ d'adresse de départ pré-rempli par défaut avec l'adresse de La Coutancière (`La Coutancière, Allée des Favrières, 44240 La Chapelle-sur-Erdre`), calculer automatiquement la distance routière aller-retour en kilomètres vers le lieu de chaque match à l'extérieur, et permettre à l'utilisateur de modifier l'adresse ou d'ajuster manuellement la distance de chaque déplacement.

#### Scenario: Adresse par défaut à La Coutancière
- **WHEN** l'utilisateur accède au formulaire des déplacements sans avoir modifié l'adresse
- **THEN** le champ d'adresse de départ contient `La Coutancière, Allée des Favrières, 44240 La Chapelle-sur-Erdre` et les distances aller-retour sont calculées depuis ce point de départ

#### Scenario: Modification de l'adresse de départ ou d'une distance kilométrique
- **WHEN** l'utilisateur saisit sa propre adresse et lance le recalcul, ou modifie directement le nombre de kilomètres aller-retour d'un match
- **THEN** les distances aller-retour et le montant total selon le barème de l'État sont mis à jour en conséquence

### Requirement: Calcul du montant selon le type de véhicule et le barème kilométrique officiel de l'État
Le système SHALL permettre à l'utilisateur de choisir le type et la puissance fiscale de son véhicule (Voiture `3 CV et moins` à `7 CV et plus`, Moto `1-2 CV`, `3-5 CV`, `> 5 CV`, Cyclomoteur `≤ 50 cm³`, avec option véhicule 100 % électrique `+20 %`) et calculer le montant de l'abandon de frais selon le barème kilométrique officiel en vigueur de l'administration fiscale.

#### Scenario: Application du barème officiel voiture thermique et majoration électrique
- **WHEN** l'utilisateur sélectionne un total de déplacements de `200 km` avec une voiture `5 CV` thermique, puis coche l'option `Véhicule 100 % électrique (+20 %)`
- **THEN** le montant calculé passe de `127,20 €` ($200 \times 0,636\text{ €}$) à `152,64 €` ($200 \times 0,636 \times 1,20\text{ €}$)

### Requirement: Génération du document Word officiel d'abandon de frais conforme à l'article 200 du CGI
Une fois le nom, le prénom, l'immatriculation, l'adresse et les matchs cochés renseignés, le système SHALL générer et télécharger un document Word (`.docx`) doté de l'en-tête et du pied de page officiels de La Chapelaine Handball et comportant le tableau détaillé des déplacements ainsi que la déclaration expresse de renonciation au remboursement conforme à l'article 200 du CGI et au `BOI-IR-RICI-250-20`.

#### Scenario: Téléchargement du document Word d'abandon de frais
- **WHEN** l'utilisateur a renseigné ses nom, prénom, immatriculation, adresse, sélectionné au moins un match passé à l'extérieur et cliqué sur le bouton de génération Word
- **THEN** un fichier `.docx` avec l'en-tête officielle du club est téléchargé, contenant l'identité du bénévole, les caractéristiques et l'immatriculation du véhicule, le détail horodaté des trajets (date, collectif, adversaire, lieu, km A/R), le montant total évalué au barème officiel de l'État, la mention expresse d'abandon en tant que don à La Chapelaine Handball (art. 200 du CGI / `BOI-IR-RICI-250-20`) et les cadres de signature
