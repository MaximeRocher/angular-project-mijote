import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'recipes',
  },
  {
    path: 'recipes',
    loadChildren: () => import('./features/recipes/recipes.routes'),
  },
  {
    path: '**',
    redirectTo: 'recipes',
  },
];
