import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Request } from './features/request/request';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, title: 'Login' },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register').then((m) => m.Register),
    title: 'Register',
  },
  { path: 'request', component: Request, title: 'Request', canActivate: [authGuard] },
  {
    path: 'rules',
    loadComponent: () => import('./features/rules/rules').then((m) => m.Rules),
    title: 'Rules',
    canActivate: [authGuard],
  },
  {
    path: 'comments',
    loadComponent: () => import('./features/comments/comments').then((m) => m.Comments),
    title: 'Comments',
    canActivate: [authGuard],
  },
  {
    path: 'my-comments',
    loadComponent: () => import('./features/my-comments/my-comments').then((m) => m.MyComments),
    title: 'My Comments',
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
    title: 'Settings',
    canActivate: [authGuard],
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
    title: 'About',
    canActivate: [authGuard],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./features/page-not-found/page-not-found').then((m) => m.PageNotFound),
    title: '404 Not Found',
  },
];
