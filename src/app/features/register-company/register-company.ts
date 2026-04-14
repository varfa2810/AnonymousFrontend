import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterCompanyDto } from '../../core/interface/Interfaces';
import { RegisterCompany } from '../../core/services/register-company';

@Component({
  selector: 'app-register-company-feature',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register-company.html',
  styleUrl: './register-company.scss',
})
export class RegisterCompanyFeature {
  private formBuilder = inject(FormBuilder);
  private registerCompanyService = inject(RegisterCompany);

  submitted = false;
  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  registerCompanyForm = this.formBuilder.group({
    companyName: ['', [Validators.required, Validators.minLength(3)]],
    employeeStrength: [null as number | null, [Validators.required, Validators.min(1)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-()\s]{7,20}$/)]],
    countryId: [null as number | null, [Validators.required, Validators.min(1)]],
    stateId: [null as number | null, [Validators.required, Validators.min(1)]],
    cityId: [null as number | null, [Validators.required, Validators.min(1)]],
    companyAddress: ['', [Validators.required, Validators.minLength(10)]],
    requesterEmail: ['', [Validators.required, Validators.email]],
  });

  hasError(controlName: keyof RegisterCompanyDto, errorName: string): boolean {
    const control = this.registerCompanyForm.get(controlName);
    return !!control && control.hasError(errorName) && (control.touched || this.submitted);
  }

  onSubmit() {
    this.submitted = true;
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.registerCompanyForm.invalid) {
      this.registerCompanyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const rawValue = this.registerCompanyForm.getRawValue();
    const payload: RegisterCompanyDto = {
      companyName: rawValue.companyName?.trim() ?? '',
      employeeStrength: Number(rawValue.employeeStrength),
      email: rawValue.email?.trim() ?? '',
      phone: rawValue.phone?.trim() ?? '',
      countryId: Number(rawValue.countryId),
      stateId: Number(rawValue.stateId),
      cityId: Number(rawValue.cityId),
      companyAddress: rawValue.companyAddress?.trim() ?? '',
      requesterEmail: rawValue.requesterEmail?.trim() ?? '',
    };

    this.registerCompanyService.registerCompany(payload).subscribe({
      next: (response) => {
        this.successMessage.set(
          response.message || 'Company registered successfully. Your request is now in review.',
        );
        this.registerCompanyForm.reset({
          companyName: '',
          employeeStrength: null,
          email: '',
          phone: '',
          countryId: null,
          stateId: null,
          cityId: null,
          companyAddress: '',
          requesterEmail: '',
        });
        this.submitted = false;
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Unable to register the company right now. Please try again.',
        );
        this.isSubmitting.set(false);
      },
    });
  }
}
