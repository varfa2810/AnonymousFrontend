import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Request } from './features/request/request';
import { authGuard } from './core/guards/auth-guard';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, title: 'Login' },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register').then((m) => m.Register),
    title: 'Register',
  },
  {
    path: 'register-company',
    loadComponent: () =>
      import('./features/register-company/register-company').then(
        (m) => m.RegisterCompanyFeature,
      ),
    title: 'Register Company',
  },
  {
    path: 'super-admin/companies',
    loadComponent: () =>
      import('./features/super-admin-companies/super-admin-companies').then(
        (m) => m.SuperAdminCompanies,
      ),
    title: 'Super Admin',
    canActivate: [superAdminGuard],
  },
  { path: 'request', component: Request, title: 'Request', canActivate: [authGuard] },
  {
    path: 'rules',
    loadComponent: () => import('./features/rules/rules').then((m) => m.Rules),
    title: 'Rules',
    canActivate: [authGuard],
    data: { allowSuperAdmin: true },
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
    data: { allowSuperAdmin: true },
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
    title: 'About',
    canActivate: [authGuard],
    data: { allowSuperAdmin: true },
  },

  {
    path: '**',
    loadComponent: () =>
      import('./features/page-not-found/page-not-found').then((m) => m.PageNotFound),
    title: '404 Not Found',
  },
];
