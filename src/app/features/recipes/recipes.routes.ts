import { Routes } from "@angular/router";

export const recipesRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./recipes-list/recipes-list").then((m) => m.RecipesList),
    title: "Toutes les recettes - Mijoté",
  },
  {
    path: "create",
    loadComponent: () =>
      import("./recipe-form/recipe-form").then((m) => m.RecipeForm),
    title: "Créer une recette - Mijoté",
  },
  {
    path: "new",
    redirectTo: "create",
    pathMatch: "full",
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./recipe-details/recipe-details").then((m) => m.RecipeDetails),
    title: "Détail de la recette - Mijoté",
  },
];

export const routes: Routes = recipesRoutes;
export default recipesRoutes;
