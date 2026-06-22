import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { catchError, map, of } from 'rxjs';

export const companyAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  return authService.checkSession().pipe(

    map(() => {

      if (authService.isCompanyAdmin()) {
        return true;
      }

      router.navigate(['/unauthorized']);
      return false;
    }),

    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
