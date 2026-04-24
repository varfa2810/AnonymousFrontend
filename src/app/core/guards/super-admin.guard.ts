import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserAuth } from '../services/user-auth';

export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(UserAuth);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return auth.isSuperAdmin() ? true : router.createUrlTree(['/request']);
  }

  return auth.checkSession().pipe(
    map((session) => {
      if (!session) {
        return router.createUrlTree(['/login']);
      }

      return auth.isSuperAdmin() ? true : router.createUrlTree(['/request']);
    }),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
