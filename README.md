# projet-angular-2026 — Mijoté

Application Angular 22 de gestion de recettes de cuisine (composants standalone, signals, lazy loading),
réalisée dans le cadre du projet Angular 2026 (binôme).
Bibliothèque CSS : **Tailwind CSS 4** (complétée par quelques feuilles de style par composant et `@tabler/icons-angular` pour les icônes).

## Démarrage

```bash
npm install
npm start        # http://localhost:4200
npm run build    # build de production dans dist/
npm test         # tests unitaires (Vitest + axe-core)
```

## Correspondance avec le sujet

### Identification

| Exigence | Réalisation |
| --- | --- |
| Application accessible uniquement après identification | `authGuard` sur toutes les routes applicatives ; `guestGuard` renvoie un utilisateur déjà connecté vers `/home` |
| Gestion du user via le LocalStorage | `AuthService` (clé `auth_user`), session restaurée au rechargement |
| Login = mot de passe, 5 caractères minimum, 1 chiffre, 1 caractère parmi `. / * - +` | `core/validators/credential.validator.ts` + vérification d'égalité dans `AuthService.login()` |
| Déconnexion possible depuis n'importe quelle page | Bouton « Déconnexion » dans la navbar du layout, présente sur toutes les pages protégées |

### Fonctionnalités

| Page | URL | TITLE | Contenu |
| --- | --- | --- | --- |
| Connexion | `/login` | Connexion - Mijoté | Formulaire login / mot de passe |
| Accueil | `/home` | Accueil - Mijoté | 5 dernières recettes (`sortBy=id&order=desc&limit=5`) : nom, 15 premiers caractères de la description, moyenne des notes |
| Toutes les recettes | `/recipes` | Toutes les recettes - Mijoté | Liste paginée (6 par page), recherche par nom (paramètre `name` de l'API), nom + 15 premiers caractères + moyenne des notes |
| Création | `/recipes/create` | Créer une recette - Mijoté | Formulaire réactif avec validation du modèle de données |
| Détail | `/recipes/:id` | `<nom de la recette> - Mijoté` | Nom, ingrédients (avec quantités), tous les avis, formulaire d'ajout d'avis |

Chaque page a sa propre URL et le TITLE de l'onglet est mis à jour à chaque navigation (propriété `title` des routes ; sur la page de détail, le titre est mis à jour avec le nom de la recette une fois celle-ci chargée).

### Modèle de données

Une recette est valide si elle a un nom, une description d'au moins 30 caractères et au moins 2 quantités d'ingrédients.
La règle est appliquée dans le formulaire (validateurs) et dans `RecipeService.validateRecipe()`.

### API

- Recettes : `https://6ab976bcf84897980b729a5b.mockapi.io/recipies`
- Ingrédients : `https://6ab976bcf84897980b729a5b.mockapi.io/ingredients`

Tri, pagination et filtre utilisent les paramètres MockAPI (`sortBy`, `order`, `page`, `limit`, `name`).
L'URL de base est configurée dans `src/environments/`. Un avis est ajouté en relisant la recette, en ajoutant l'avis au tableau `rates`, puis en la renvoyant par `PUT`.

## Adaptations et ajouts par rapport au sujet

- **Page de présentation `/landing`** (non demandée) : page publique avec illustrations vectorielles et animations GSAP. Pour respecter la déconnexion « depuis n'importe quelle page », elle affiche un bouton « Déconnexion » quand l'utilisateur est connecté.
- **Présentation des recettes** : l'accueil les affiche en liste, `/recipes` en cartes. Dans les deux cas seuls le nom, les 15 premiers caractères de la description (suivis de « … ») et la moyenne des notes sont affichés.
- **Note moyenne** : arrondie à 0,1 près ; « Non noté » si la recette n'a aucun avis.
- **Pagination** : l'API ne renvoie pas de total. On effectue donc une première requête (avec le filtre) pour compter les résultats, puis une seconde pour la page demandée. Un `404` de MockAPI (aucun résultat de recherche) est traité comme une liste vide.
- **Quantités** : chaque ingrédient doit avoir une quantité d'au moins 1. Il est impossible de descendre sous 2 lignes d'ingrédients dans le formulaire.
- **Avis** : la note va de 1 à 5, le commentaire est optionnel (500 caractères maximum). L'auteur est le login de l'utilisateur connecté.
- **Redirections** : `/recipes/new` redirige vers `/recipes/create` ; toute URL inconnue redirige vers `/home`.
- **Animations** (GSAP : transitions de page, apparition en cascade, inclinaison 3D des cartes) : elles sont désactivées si l'utilisateur demande une réduction des animations.

## Architecture

```
src/app/
├── core/        modèles, services (auth, recipe, ingredient, gsap), guards, interceptor d'erreurs, validateurs
├── shared/      navbar, loader, recipe-card, pagination, confirm-dialog, illustrations, directives, pipe truncate
└── features/    landing, login, layout (navbar + router-outlet), home, recipes (liste, formulaire, détail)
```

Les routes de chaque feature sont chargées en lazy loading.

## Accessibilité

Les composants visent WCAG AA : lien d'évitement, `aria-current` sur la navigation, focus visible, annonces `role="status"` / `role="alert"`, labels sur tous les champs, animations réduites si demandé.
Des tests `axe-core` (`*.a11y.spec.ts`) vérifient la page de connexion et la navbar (le contraste n'est pas testable sous jsdom).

## Répartition

D'après l'historique git :

- **Maxime** : authentification (page de connexion, `AuthService`, guards, validateur d'identifiants), layout et navbar, page d'accueil, pipe `truncate` et directive `highlight`, design tokens et styles globaux, refonte graphique matcha/pistache, boîte de dialogue de confirmation, tests d'accessibilité (axe-core), README et mise en conformité avec le sujet (moyenne des notes sur l'accueil, titres des pages, déconnexion sur la landing, liste des recettes allégée).
- **Guillaume** : modèles de données, services de recettes et d'ingrédients, intercepteur d'erreurs, fonctionnalité recettes (liste paginée avec recherche, formulaire de création, page de détail avec avis), composants `recipe-card`, `pagination` et `loader`, puis la couche visuelle animée : page `/landing`, GSAP, transitions de page, inclinaison 3D, illustrations vectorielles.
