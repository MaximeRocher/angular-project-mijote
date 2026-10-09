# Mijote

Application Angular 22 de gestion de recettes de cuisine (composants standalone, signals, Signal Forms, lazy loading).

## Démarrage

```bash
npm install
npm start        # http://localhost:4200
npm run build    # build de production dans dist/
npm test         # tests unitaires (Vitest)
```

## Fonctionnalités

- **Connexion** (`/login`) : le login et le mot de passe doivent être identiques et respecter
  `^(?=.*[0-9])(?=.*[./*\-+]).{5,}$` (5 caractères minimum, un chiffre, un caractère parmi `. / * - +`).
  La session est stockée dans le `localStorage`.
- **Accueil** (`/home`) : les 5 dernières recettes, description tronquée à 15 caractères.
- **Recettes** (`/recipes`) : liste paginée avec recherche, puis création d'une recette (`/recipes/create`).
- Toutes les routes sauf `/login` sont protégées par `authGuard` ; `guestGuard` renvoie un utilisateur déjà connecté vers `/home`.

## Architecture

```
src/app/
├── core/        modèles, services (auth, recipe, ingredient), guards, interceptor, validateurs
├── shared/      navbar, loader, recipe-card, pagination, directive highlight, pipe truncate
└── features/    login, home, layout (navbar + router-outlet), recipes
```

L'API (mockapi) est configurée dans `src/environments/`.

## Accessibilité

Les composants visent WCAG AA : lien d'évitement, `aria-current` sur la navigation, focus visible global,
animations réduites si demandé. Des tests `axe-core` (`*.a11y.spec.ts`) vérifient la page de connexion et la navbar
(le contraste n'est pas testable sous jsdom).

## Répartition

- **Personne A** : authentification, accueil, layout et navbar, styles globaux.
- **Personne B** : recettes (liste, formulaire), services de données, interceptor d'erreurs, loader, recipe-card, pagination.
