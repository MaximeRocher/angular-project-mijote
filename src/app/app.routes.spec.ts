import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { recipesRoutes } from './features/recipes/recipes.routes';

describe('appRoutes', () => {
  it('should define redirect from empty path to recipes', () => {
    const rootRoute = routes.find((r) => r.path === '');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.redirectTo).toBe('recipes');
    expect(rootRoute?.pathMatch).toBe('full');
  });

  it('should lazy load recipes routes under "recipes"', async () => {
    const recipesRoute = routes.find((r) => r.path === 'recipes');
    expect(recipesRoute).toBeDefined();
    expect(recipesRoute?.loadChildren).toBeDefined();

    if (recipesRoute?.loadChildren) {
      const loaded = await (recipesRoute.loadChildren as () => Promise<unknown>)();
      // Can be either the module with default/routes or an array of routes
      const loadedRoutes = (loaded as { default?: unknown; routes?: unknown }).routes
        ?? (loaded as { default?: unknown }).default
        ?? loaded;
      expect(loadedRoutes).toBe(recipesRoutes);
    }
  });

  it('should redirect wildcard path to recipes', () => {
    const wildcardRoute = routes.find((r) => r.path === '**');
    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute?.redirectTo).toBe('recipes');
  });

  it('should navigate to /recipes when navigating to root /', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    expect(router.url).toBe('/recipes');
  });

  it('should navigate to /recipes when navigating to an unknown route', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/some/unknown/route');
    expect(router.url).toBe('/recipes');
  });
});
