import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private userService = inject(Auth);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  showPassword = false;
  submitted = false;
  loginErrorMessage = signal('');
  isLoggingIn = signal(false);

  loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onLogin() {
    if (this.isLoggingIn()) {
      return;
    }

    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoggingIn.set(true);

    this.userService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isLoggingIn.set(false)))
      .subscribe({
        next: (session) => {
          if (session) {
            this.submitted = false;
            if (this.userService.isSuperAdmin()) {
              this.router.navigate(['/super-admin/companies']);
              return;
            }

            this.router.navigate(['/request']);
          }
        },
        error: (err) => {
          console.error('login failed', err.status);
          if (err?.status === 401 || err?.status === 400) {
            this.loginErrorMessage.set('Invalid username or password.');
            this.loginForm.reset({
              username: '',
              password: '',
            });
            this.submitted = false;
            return;
          }

          this.loginErrorMessage.set('Unable to login right now. Please try again.');
        },
      });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.hasError(errorName) && (control.touched || this.submitted);
  }

  clearLoginError() {
    this.loginErrorMessage.set('');
  }
}
