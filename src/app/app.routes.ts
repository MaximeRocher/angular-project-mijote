import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { transitionGuard } from './core/guards/transition.guard';

export const routes: Routes = [
  {
    path: 'landing',
    canActivate: [transitionGuard],
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
    title: 'Mijote — Cuisinez, Partagez, Savourez',
  },
  {
    path: 'login',
    canActivate: [guestGuard, transitionGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [transitionGuard],
    loadComponent: () => import('./features/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'recipes',
        loadChildren: () => import('./features/recipes/recipes.routes'),
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
