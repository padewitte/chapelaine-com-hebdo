# 🛠️ Guide de développement — Super Chapelaine

## Lancer le projet

### Serveur local (recommandé)

```bash
make servir
# → http://localhost:8080
```

Cela lance un serveur HTTP Python sur le port 8080. Les ES Modules
nécessitent un serveur HTTP (ils ne fonctionnent pas en `file://`).

### Changer le port

```bash
make servir PORT=3000
```

### Vérifier la structure

```bash
make verifier
```

Cette commande contrôle que tous les fichiers essentiels sont présents.

---

## Ajouter un nouveau module

Pour ajouter un module au projet (par exemple `frais-km`) :

### 1. Créer les fichiers du module

```
js/
├── frais-km/
│   ├── initialiser.js      ← Point d'entrée du module
│   ├── extracteurs/        ← Extraction des données
│   ├── renderers/          ← Rendu dans le DOM
│   └── config.js           ← Configuration spécifique
```

### 2. Enregistrer le module dans l'application

Ajouter l'import et l'initialisation dans `js/app.js`.

### 3. Ajouter la navigation dans le HTML

Ajouter une section et un lien de navigation dans `index.html`.

### 4. Créer le répertoire de ressources

```bash
mkdir -p ressources/frais-km
```

### 5. Mettre à jour la documentation

- Mettre à jour `docs/architecture.md` (diagrammes)
- Mettre à jour `AGENTS.md` (liste des modules)
- Mettre à jour `README.md` (tableau des modules)

---

## Conventions de nommage

### Fichiers et répertoires

| Élément             | Convention                | Exemple                       |
|---------------------|---------------------------|-------------------------------|
| Répertoires         | kebab-case                | `attestation-de-paiement/`    |
| Fichiers JS         | camelCase ou kebab-case   | `extracteurCsv.js`            |
| Fichiers CSS        | kebab-case                | `style.css`                   |
| Fichiers de données | kebab-case                | `modele-licencie-adresse.csv` |
| Documentation       | kebab-case                | `architecture.md`             |

### Code JavaScript

| Élément           | Convention               | Exemple                    |
|-------------------|--------------------------|----------------------------|
| Variables         | camelCase, en français   | `listeLicencies`           |
| Constantes        | MAJUSCULES_SERPENT        | `SEPARATEUR_CSV`           |
| Fonctions         | camelCase, verbe français | `extraireLicencies()`     |
| Classes           | PascalCase, en français  | `ParseurGestHand`          |
| Modules (export)  | fonctions nommées        | `export { extraireDonnees }` |

### CSS

| Élément           | Convention               | Exemple                    |
|-------------------|--------------------------|----------------------------|
| Classes           | kebab-case               | `.carte-licencie`          |
| Variables CSS     | `--kebab-case`           | `--couleur-orange`         |
| ID                | kebab-case               | `#section-attestation`     |

---

## Workflow git avec worktrees

### Pourquoi des worktrees ?

Les worktrees git permettent de travailler sur plusieurs branches
simultanément sans avoir à jongler avec `git stash` ou des clones
multiples.

### Créer un worktree

```bash
make worktree-creer NOM=ma-fonctionnalite
cd ../super-chapelaine--ma-fonctionnalite
```

### Travailler dans le worktree

Le worktree est un répertoire complet avec le code de la branche.
On y travaille normalement (éditer, commiter, pousser).

### Revue et Pull Request

> ⛔ **Protection de `main`** : Ne **jamais pousser directement sur `main`** (`git push origin main` interdit). Tout développement ou contribution assistée par IA / agent doit obligatoirement passer par une branche dédiée et une Pull Request.

Avant de finaliser :

1. **Revue pas à pas** : relire chaque changement dans le diff (`git diff main`).
2. **Vérification qualité** : exécuter `make verifier` et `make openspec-verifier`.
3. **Pousser la branche de travail** :
   ```bash
   git push -u origin ma-fonctionnalite
   ```
4. **Ouvrir une Pull Request** : créer la PR vers `main` sur GitHub.
5. **Merge via la PR** : la fusion sur `main` se fait uniquement après revue dans l'interface GitHub (pas de merge direct en local).

### Supprimer le worktree

Une fois la Pull Request mergée :
```bash
make worktree-supprimer NOM=ma-fonctionnalite
```

---

## Sessions IA

### Créer une session

```bash
make session
# ou avec un modèle spécifique
make session MODELE=claude
make session MODELE=gpt-4
```

### Contenu d'une session

Chaque session est un fichier Markdown dans `.sessions/` qui documente :

- 📅 Date et heure de la session
- 🤖 Modèle IA utilisé
- 🌿 Branche git active
- 🎯 Objectifs de la session
- 📝 Résumé des actions effectuées
- ✅ Décisions prises

### Pourquoi documenter les sessions ?

- Garder une trace du travail fait avec les agents IA
- Permettre la reprise par un autre agent ou humain
- Historique des décisions techniques

---

## Tests et vérification visuelle

### Pas de framework de test

Le projet n'utilise pas de framework de test automatisé. La vérification
se fait visuellement dans le navigateur.

### Procédure de vérification

1. **Lancer le serveur** : `make servir`
2. **Ouvrir le navigateur** : `http://localhost:8080`
3. **Tester chaque fonctionnalité** modifiée :
   - Charger un fichier CSV d'exemple
   - Vérifier le rendu à l'écran
   - Tester l'export (DOCX, Google Sheets…)
4. **Vérifier la console** : pas d'erreur JavaScript
5. **Tester le responsive** : redimensionner la fenêtre

### Fichiers d'exemple

Des fichiers d'exemple sont disponibles dans `ressources/` pour tester
sans données réelles :

- `ressources/attestation-de-paiement/exemple-licencies-valide.csv`
- `ressources/attestation-de-paiement/tarifs.csv`

---

## Méthodologie OpenSpec

Le projet applique la démarche **OpenSpec** (développement piloté par les spécifications). Tout agent IA ou contributeur doit inscrire ses évolutions dans ce cadre.

### Vérifier la configuration OpenSpec

Pour valider l'environnement OpenSpec en une seule commande :

```bash
make openspec-verifier
```

Cette commande contrôle :
1. La disponibilité du CLI `openspec` dans le `PATH`.
2. L'intégrité de la racine du projet (`openspec doctor`).
3. La validité des fichiers de spécifications et modifications (`openspec validate --all`).
4. La présence des configurations et compétences pour les agents.

### Cycle d'évolution d'une fonctionnalité

1. **Exploration** (`openspec-explore` ou `/opsx-explore`) : cadrer le problème et affiner les besoins.
2. **Proposition** (`openspec-propose` ou `/opsx-propose <nom>`) : rédiger la proposition, la spécification fonctionnelle delta, l'architecture technique et les tâches sans toucher au code applicatif.
3. **Application** (`openspec-apply-change` ou `/opsx-apply`) : développer les fonctionnalités tâche par tâche en validant visuellement chaque étape.
4. **Archivage** (`openspec-archive-change` ou `/opsx-archive`) : clôturer le lot et synchroniser les spécifications.

---

## Commandes utiles

| Commande                           | Description                        |
|------------------------------------|------------------------------------|
| `make help`                        | Afficher l'aide                    |
| `make servir`                      | Lancer le serveur local            |
| `make verifier`                    | Vérifier la structure du projet    |
| `make session`                     | Créer une session IA               |
| `make worktree-creer NOM=x`       | Créer un worktree                  |
| `make worktree-supprimer NOM=x`   | Supprimer un worktree              |
| `make openspec-verifier`          | Vérifier la configuration OpenSpec |
| `make nettoyer`                    | Nettoyer les fichiers temporaires  |
