import { recipesRoutes } from './recipes.routes';
import { RecipesList } from './recipes-list/recipes-list';
import { RecipeForm } from './recipe-form/recipe-form';

describe('recipesRoutes', () => {
  it('should define root route loading RecipesList', async () => {
    const rootRoute = recipesRoutes.find((r) => r.path === '');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.title).toBe('Toutes les recettes - Mijoté');

    if (rootRoute?.loadComponent) {
      const component = await (rootRoute.loadComponent as () => Promise<unknown>)();
      expect(component).toBe(RecipesList);
    }
  });

  it('should define create route loading RecipeForm', async () => {
    const createRoute = recipesRoutes.find((r) => r.path === 'create');
    expect(createRoute).toBeDefined();
    expect(createRoute?.title).toBe('Créer une recette - Mijoté');

    if (createRoute?.loadComponent) {
      const component = await (createRoute.loadComponent as () => Promise<unknown>)();
      expect(component).toBe(RecipeForm);
    }
  });

  it('should redirect new to create', () => {
    const newRoute = recipesRoutes.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.redirectTo).toBe('create');
    expect(newRoute?.pathMatch).toBe('full');
  });
});
