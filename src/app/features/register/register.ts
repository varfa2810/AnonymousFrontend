import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { ApiResponse } from '../../core/interface/Interfaces';
import { Auth } from '../../core/services/auth';

const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

const uniqueUsernameValidator = (userAuth: Auth): AsyncValidatorFn => {
  return (control: AbstractControl) => {
    const username = control.value?.trim();

    if (!username || username.length < 3) {
      return of(null);
    }

    return timer(300).pipe(
      switchMap(() => userAuth.checkUniqueUsername(username)),
      map((response: ApiResponse<boolean>) => (response.data ? null : { usernameTaken: true })),
      catchError(() => of(null)),
    );
  };
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private userAuth = inject(Auth);

  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  registerForm = this.formBuilder.group(
    {
      username: this.formBuilder.control('', {
        validators: [Validators.required, Validators.minLength(3)],
        asyncValidators: [uniqueUsernameValidator(this.userAuth)],
      }),
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  hasError(controlName: string, errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.hasError(errorName) && (control.touched || this.submitted);
  }

  get passwordsDoNotMatch(): boolean {
    const confirmPassword = this.registerForm.get('confirmPassword');
    return (
      !!confirmPassword &&
      this.registerForm.hasError('passwordMismatch') &&
      (confirmPassword.touched || this.submitted)
    );
  }

  get isCheckingUsername(): boolean {
    return this.registerForm.get('username')?.pending ?? false;
  }

  onSubmit() {
    this.submitted = true;
    this.registerForm.markAllAsTouched();
    this.registerForm.get('username')?.updateValueAndValidity();

    if (this.registerForm.pending || this.registerForm.invalid) {
      return;
    }
  }
}
