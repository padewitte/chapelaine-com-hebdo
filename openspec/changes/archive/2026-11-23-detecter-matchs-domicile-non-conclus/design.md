# Design

## Context

Voir `proposal.md` pour le contexte métier. Actuellement :
- `DataExtractor` stocke les lignes brutes des fichiers CSV de type `programme` dans `store.matchsParSemaine` (indexé par semaine ISO `YYYY-SS`).
- `DataCleaner.nettoyer(ligne)` transforme une ligne brute en objet match pour la semaine sélectionnée, mais n'expose pas de méthode dédiée pour diagnostiquer les éléments manquants d'une conclusion de match (`Date`, `Horaire`, `Salle`) ni pour regrouper une triangulaire non conclue sur une seule ligne.
- Dans `index.html`, le bloc `<div class="alert" id="alert-erreurs" style="display:none">` est déjà positionné dans `#module-com-hebdo` juste sous `.upload-row` et au-dessus de `.tabs`, mais n'est pas exploité.

## Goals / Non-Goals

**Goals:**
- Détecter automatiquement sur l'ensemble des semaines futures (par rapport à la date du jour) tous les matchs à domicile non conclus dès l'import des fichiers CSV GestHand.
- Regrouper sur une seule ligne les rencontres d'une même triangulaire de coupe hébergée à domicile (`(semaine, num poule)` identiques).
- Différencier visuellement avec force l'urgence à $\le 6$ semaines (alerte critique ouverte par défaut) et le préavis à $> 6$ semaines (section repliable).

**Non-Goals:**
- Alerter sur les matchs à l'extérieur non conclus (la conclusion dans GestHand incombe au club hôte adverse).
- Modifier le fonctionnement des sous-onglets du tableau Kifekoi de la semaine sélectionnée (`Coutancière`, `Jean Jahan`, `Olympie`, `Extérieur`, `Match non défini`).

## Decisions

### 1. Diagnostic de non-conclusion dans `DataCleaner`
Ajouter une méthode `DataCleaner.analyserNonConclu(ligne)` (ou enrichir l'objet nettoyé) qui :
- Vérifie que `this.isMatchDom(ligne)` est vrai.
- Vérifie qu'au moins un participant est renseigné (`(ligne['club rec'] || '').trim()` ou `(ligne['club vis'] || '').trim()`), afin d'ignorer les réservations de créneaux sans équipes (ex. `Trophée Patrick Féminin` en `2026-36`).
- Évalue les trois critères de conclusion :
  - `manqueDate = !(ligne['le'] || '').trim()`
  - `manqueHoraire = !(ligne['horaire'] || '').trim()`
  - `salleBrute = (ligne['nom salle'] || '').trim()`
  - `manqueSalle = !salleBrute || /inconnu|a\s*d[eé]finir|non\s*d[eé]fini/i.test(salleBrute)`
- Retourne `null` si le match est conclu (`!manqueDate && !manqueHoraire && !manqueSalle`), ou un objet décrivant le match non conclu avec la liste des éléments manquants (`manquants: ['Date', 'Horaire', 'Salle']`).

### 2. Regroupement des triangulaires sur une ligne dans `DataExtractor`
Ajouter `DataExtractor.getMatchsDomicileNonConclus(dateRef = new Date())` :
- Parcourt `store.matchsParSemaine` par ordre chronologique de `semaine`.
- Ne retient que les semaines dont le samedi est supérieur ou égal au début de la journée de `dateRef` (`samediMatch >= aujourdhui`).
- Pour chaque semaine, regroupe les lignes à domicile non conclues par clé `${semaine}::${ligne['num poule'] || ligne['code renc']}` :
  - **Match simple (1 ligne dans le groupe)** : conserve l'équipe (`poule` résolue via `nomPoule`) et l'adversaire nettoyé.
  - **Triangulaire / plateau à domicile (> 1 ligne dans le groupe)** :
    - Collecte tous les clubs participants des lignes du groupe qui ne sont pas notre équipe (`!estNotreEquipe(nom, num)`), nettoyés via `DataCleaner.cleanNomEquipe(nom)` et dédoublonnés tout en préservant l'ordre d'apparition.
    - Formate l'adversaire sous la forme `${adversaires.join(' / ')} (Triangulaire)`.
    - Agrège l'union des éléments manquants (`Date`, `Horaire`, `Salle`).

### 3. Calcul de l'échéance à 6 semaines par rapport à la date du jour
- Pour calculer le nombre de semaines avant le match de façon fiable même lors du passage d'une année à 53 semaines ISO (`2026-48` → `2027-01`) :
  - Déterminer `samediCourant` : le samedi de la semaine calendaire contenant `dateRef` (à `00:00:00`).
  - Déterminer `samediMatch` : le samedi de la semaine `YYYY-SS` du match (`getSamediDate(semaine)` à `00:00:00`).
  - Calculer :
    ```js
    const delaiSemaines = Math.round((samediMatch - samediCourant) / (7 * 24 * 3600 * 1000));
    ```
  - Un match est en **alerte forte (urgent)** si `delaiSemaines <= 6`, et en **préavis** si `delaiSemaines > 6`.

### 4. Architecture UI du panneau d'alerte dans `#module-com-hebdo`
Exploiter le conteneur `#alert-erreurs` dans `index.html` et `js/com-hebdo/com-hebdo-app.js` :
- **Structure HTML dynamique** :
  - Si `urgents.length > 0` ($\le 6$ semaines) :
    - Classe `.alert.alert--urgent` (bordure rouge/orange marquée `#ff4d4d` / `var(--orange)`, fond contrasté, icône `🚨`).
    - En-tête : titre fort indiquant le nombre de matchs à domicile à conclure sous 6 semaines, accompagné d'un bouton de fermeture (`✕`, `.alert-close`) permettant à l'utilisateur de masquer l'alerte.
    - Tableau compact listant les matchs urgents (colonnes : `Semaine`, `Échéance`, `Équipe`, `Adversaire`, `Manquant`).
    - Si `preavis.length > 0` ($> 6$ semaines) : bloc `<details class="alert-details">` en bas du panneau permettant d'afficher au clic le tableau des matchs à $> 6$ semaines.
  - Si `urgents.length === 0 && preavis.length > 0` :
    - Classe `.alert.alert--preavis` (style ambre discret).
    - Bloc `<details class="alert-details">` replié par défaut avec le résumé (`📅 X matchs à domicile non conclus à plus de 6 semaines`).
  - Si aucun match non conclu : `alertEl.style.display = 'none'`.

## Risks / Trade-offs

- **[Risque] Années bissextiles ou à 53 semaines ISO (ex. fin 2026 → début 2027)** → Le calcul de `delaiSemaines` repose exclusivement sur la différence entre objets `Date` (`samediMatch - samediCourant`) et non sur une soustraction arithmétique des numéros de semaine (`53 - 48 + 1`), ce qui garantit un calcul exact au changement d'année.
