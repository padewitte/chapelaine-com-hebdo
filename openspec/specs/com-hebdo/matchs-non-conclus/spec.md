# com-hebdo/matchs-non-conclus Specification

## Purpose

Cette capacité définit la détection inter-semaines des matchs à domicile non conclus (sans date, horaire ou salle définie / lieu inconnu) dans les semaines à venir par rapport à la date du jour, le regroupement des triangulaires hébergées à domicile sur une seule ligne, et l'affichage d'un panneau d'alerte refermable dans l'onglet Com Hebdo avec une alerte visuelle forte à 6 semaines ou moins de l'échéance.

## Requirements

### Requirement: Détection des matchs à domicile non conclus dans les semaines à venir
À partir des fichiers CSV de type programme importés, le système SHALL détecter toutes les rencontres à domicile (`estDomicile === true`) des semaines à venir par rapport à la date du jour qui comportent au moins un participant et dont la date (`le`), l'horaire (`horaire`) ou la salle (`nom salle` vide ou lieu inconnu) n'est pas défini.

#### Scenario: Match à domicile futur sans date ni salle ou avec lieu inconnu
- **WHEN** un fichier CSV programme contient un match à domicile situé dans une semaine future dont les champs `le`, `horaire` ou `nom salle` sont vides (ou dont `nom salle` contient `lieu inconnu`)
- **THEN** le match est retenu dans la liste des matchs à domicile non conclus avec l'indication des informations manquantes (`Date`, `Horaire`, `Salle`)

#### Scenario: Exclusion des matchs à l'extérieur, des semaines passées et des créneaux vides
- **WHEN** un fichier CSV programme contient un match à l'extérieur sans date ni salle, ou un match non conclu d'une semaine antérieure à la date du jour, ou une ligne de réservation de salle sans `club rec` ni `club vis`
- **THEN** ces lignes sont exclues de la liste des matchs à domicile non conclus à venir

### Requirement: Regroupement sur une ligne des triangulaires à domicile non conclues
Lorsque plusieurs rencontres à domicile non conclues partagent la même semaine et le même code de poule (`num poule`), comme les trois rencontres d'une triangulaire de coupe hébergée par le club, le système SHALL les regrouper sur une seule ligne dans l'alerte en affichant le collectif du club et la liste dédoublonnée des clubs adverses accompagnée de la mention `(Triangulaire)`.

#### Scenario: Triangulaire de coupe départementale hébergée à domicile non conclue
- **WHEN** la semaine `2027-01` comporte trois rencontres non conclues pour la poule `M62445501U` (`coupe u14m - 44`, `TRIANGULAIRE 2`) hébergée par `LA CHAPELAINE` impliquant `LA CHAPELAINE`, `NORT AC HANDBALL` et `FANS HB LIGNE`
- **THEN** le panneau d'alerte affiche une seule ligne pour cette triangulaire avec l'équipe `U14M-1` et l'adversaire `Nort / Ligné (Triangulaire)`

### Requirement: Alerte visuelle graduée à 6 semaines précédant le match dans l'onglet Com Hebdo
Le système SHALL calculer l'écart en semaines entre le samedi de la semaine courante (déterminé à partir de la date du jour) et le samedi de la semaine de chaque match à domicile non conclu, et afficher un panneau d'alerte refermable dans l'onglet Com Hebdo (sous la zone d'import CSV) avec une alerte visuellement forte lorsque l'échéance est inférieure ou égale à 6 semaines.

#### Scenario: Présence de matchs à domicile non conclus à 6 semaines ou moins
- **WHEN** au moins un match à domicile non conclu se situe à une échéance inférieure ou égale à 6 semaines par rapport à la date du jour (par exemple la semaine `2027-01` consultée le `23/11/2026`, soit en semaine `2026-48`)
- **THEN** le panneau s'affiche en mode d'alerte forte (style rouge-orangé critique), présente directement la liste des matchs à conclure sous 6 semaines avec leur semaine, leur délai restant, l'équipe, l'adversaire et les éléments manquants, et regroupe les éventuels matchs à plus de 6 semaines dans un bloc repliable secondaire

#### Scenario: Fermeture manuelle de l'alerte par l'utilisateur
- **WHEN** l'utilisateur clique sur le bouton de fermeture (`✕`) du panneau d'alerte
- **THEN** le panneau d'alerte est masqué jusqu'au prochain import de fichiers CSV

#### Scenario: Présence uniquement de matchs à domicile non conclus à plus de 6 semaines
- **WHEN** tous les matchs à domicile non conclus détectés se situent à strictement plus de 6 semaines de la date du jour
- **THEN** le panneau s'affiche en mode de préavis modéré (style ambre discret), replié par défaut avec le compteur des matchs à venir

#### Scenario: Aucun match à domicile non conclu dans les semaines à venir
- **WHEN** tous les matchs à domicile des semaines à venir disposent d'une date, d'un horaire et d'une salle valide
- **THEN** le panneau d'alerte est masqué
