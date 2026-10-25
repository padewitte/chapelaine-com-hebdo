# 🤾 Super Chapelaine — Outils de gestion du club

Application web statique (SPA) regroupant les outils de gestion du club
de handball **La Chapelaine**.

## Modules

| Module | Description | Statut |
|--------|-------------|--------|
| **Attestation de paiement** | Génération d'attestations de paiement de licences | ✅ Actif |
| **Com' hebdo** | Communication hebdomadaire — import GestHand CSV, planning, export Google Sheets | ✅ Actif |
| **Frais km** | Fiches de frais kilométriques | 🔜 À venir |
| **Assistance** | Gestion assistance membres | 🔜 À venir |

## Démarrer

Aucun build, aucune installation. Ouvrir `index.html` dans un navigateur :

```bash
# Avec un serveur local (recommandé)
make servir
# → http://localhost:8080

# Ou simplement ouvrir le fichier
open index.html
```

## Technologies

- HTML · CSS · JavaScript vanilla (ES Modules)
- Aucun framework, aucun bundler, aucun backend
- Hébergé sur GitHub Pages
- Librairies externes via CDN uniquement

## Contribuer

1. Créer une branche ou un worktree git pour la fonctionnalité :
   ```bash
   make worktree-creer NOM=ma-fonctionnalite
   # ou git checkout -b feature/ma-fonctionnalite
   ```
2. Respecter les conventions de code (indentation 2 espaces, guillemets simples, points-virgules, tout en français).
3. Contrôler la qualité avec `make verifier` et `make openspec-verifier`.
4. Pousser la branche et **ouvrir une Pull Request vers `main`** (interdiction formelle de pousser directement sur `main`).
5. La fusion se fait via la PR après revue.

## Documentation

- 📖 [Architecture du projet](docs/architecture.md) — vue d'ensemble et diagrammes
- 🛠️ [Guide de développement](docs/developpement.md) — comment développer et contribuer
- 🤖 **Agents IA** : consultez le fichier [AGENTS.md](AGENTS.md) pour les instructions complètes.

## Licence

Projet interne du club La Chapelaine.
