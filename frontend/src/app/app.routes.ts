import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'sklenitev', pathMatch: 'full' },
  {
    path: 'sklenitev',
    title: 'Sklenitev zavarovanja',
    loadComponent: () =>
      import('./features/sklenitev/sklenitev-page').then((m) => m.SklenitevPage),
  },
  {
    path: 'police',
    title: 'Sklenjene police',
    loadComponent: () => import('./features/police/police-page').then((m) => m.PolicePage),
  },
  { path: '**', redirectTo: 'sklenitev' },
];
