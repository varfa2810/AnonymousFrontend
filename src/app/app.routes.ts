import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Request } from './features/request/request';
import { authGuard } from './core/guards/auth-guard';
import { superAdminGuard } from './core/guards/super-admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login, title: 'Login' },

  {
    path: 'register',
    loadComponent: () => import('./features/register/register').then((c) => c.Register),
    title: 'Register',
  },

  {
    path: 'register-company',
    loadComponent: () =>
      import('./features/register-company/register-company').then(
        (c) => c.RegisterCompanyFeature,
      ),
    title: 'Register Company',
  },

  {
    path: 'super-admin/companies',
    loadComponent: () =>
      import('./features/super-admin-companies/super-admin-companies').then(
        (c) => c.SuperAdminCompanies,
      ),
    title: 'Super Admin',
    canActivate: [superAdminGuard, authGuard],
  },

  { path: 'request', component: Request, title: 'Request', canActivate: [authGuard] },

  {
    path: 'rules',
    loadComponent: () => import('./features/rules/rules').then((c) => c.Rules),
    title: 'Rules',
    canActivate: [authGuard],
  },

  {
    path: 'comments',
    loadComponent: () => import('./features/comments/comments').then((c) => c.Comments),
    title: 'Comments',
    canActivate: [authGuard],
  },

  {
    path: 'my-comments',
    loadComponent: () => import('./features/my-comments/my-comments').then((c) => c.MyComments),
    title: 'My Comments',
    canActivate: [authGuard],
  },

  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then((c) => c.Settings),
    title: 'Settings',
    canActivate: [authGuard],
    data: { allowSuperAdmin: true },
  },

  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((c) => c.About),
    title: 'About',
    canActivate: [authGuard],
    data: { allowSuperAdmin: true },
  },

  {
    path: '**',
    loadComponent: () =>
      import('./features/page-not-found/page-not-found').then((c) => c.PageNotFound),
    title: '404 Not Found',
  },
];
