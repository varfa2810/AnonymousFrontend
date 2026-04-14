import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { RegisterCompany } from './register-company';

describe('RegisterCompany', () => {
  let service: RegisterCompany;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(RegisterCompany);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
