import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'sklenitev', pathMatch: 'full' },
  {
    path: 'sklenitev',
    title: 'Sklenitev zavarovanja',
    loadComponent: () =>
      import('./features/sklenitev/sklenitev-page').then((m) => m.SklenitevPage),
  },
  // '/police' route is added in Phase 5 (policy list).
  { path: '**', redirectTo: 'sklenitev' },
];
