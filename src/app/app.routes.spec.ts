import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { recipesRoutes } from './features/recipes/recipes.routes';

describe('appRoutes', () => {
  const layoutRoute = routes.find((r) => r.path === '' && r.children);

  it('should wrap authenticated routes in the layout', () => {
    expect(layoutRoute).toBeDefined();
    expect(layoutRoute?.canActivate).toHaveLength(1);
    expect(layoutRoute?.loadComponent).toBeDefined();
  });

  it('should redirect the empty path to home inside the layout', () => {
    const emptyRoute = layoutRoute?.children?.find((r) => r.path === '');
    expect(emptyRoute?.redirectTo).toBe('home');
    expect(emptyRoute?.pathMatch).toBe('full');
  });

  it('should lazy load recipes routes under "recipes" inside the layout', async () => {
    const recipesRoute = layoutRoute?.children?.find((r) => r.path === 'recipes');
    expect(recipesRoute?.loadChildren).toBeDefined();

    const loaded = await (recipesRoute!.loadChildren as () => Promise<unknown>)();
    const loadedRoutes =
      (loaded as { default?: unknown }).default ?? (loaded as { routes?: unknown }).routes ?? loaded;
    expect(loadedRoutes).toBe(recipesRoutes);
  });

  it('should redirect wildcard path to home', () => {
    const wildcardRoute = routes.find((r) => r.path === '**');
    expect(wildcardRoute?.redirectTo).toBe('home');
  });

  it('should send unauthenticated users to /login from root and unknown routes', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    expect(router.url).toBe('/login');

    await router.navigateByUrl('/some/unknown/route');
    expect(router.url).toBe('/login');
  });

  it('should expose a public landing route without auth guard', async () => {
    const landingRoute = routes.find((r) => r.path === 'landing');
    expect(landingRoute).toBeDefined();
    expect(landingRoute?.canActivate).toBeUndefined();
    expect(landingRoute?.title).toBe('Mijote — Cuisinez, Partagez, Savourez');
    expect(landingRoute?.loadComponent).toBeDefined();

    const loaded = await (landingRoute!.loadComponent as () => Promise<unknown>)();
    expect(loaded).toBeDefined();
  });
});
