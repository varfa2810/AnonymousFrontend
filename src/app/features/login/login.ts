import { Component, inject, signal } from '@angular/core';
import { UserAuth } from '../../core/services/user-auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private userService = inject(UserAuth);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  showPassword = false;
  submitted = false;
  loginErrorMessage = signal('');

  loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onLogin() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.userService
      .login(this.loginForm.getRawValue())
      .pipe(switchMap((res) => (res.status == 200 ? this.userService.checkSession() : EMPTY)))
      .subscribe({
        next: (session) => {
          if (session) {
            this.submitted = false;
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
          } else {
            this.loginErrorMessage.set('Unable to login right now. Please try again.');
          }
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
