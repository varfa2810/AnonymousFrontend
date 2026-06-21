import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { companyAdminGuard } from './company-admin-guard';

describe('companyAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => companyAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
