import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCompanyFeature } from './register-company';

describe('RegisterCompanyFeature', () => {
  let component: RegisterCompanyFeature;
  let fixture: ComponentFixture<RegisterCompanyFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterCompanyFeature],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterCompanyFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
