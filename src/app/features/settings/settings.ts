import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserAuth } from '../../core/services/user-auth';

const uniqueUsernameValidator = (userAuth: UserAuth, currentUsername: string | null): AsyncValidatorFn => {
  return (control: AbstractControl) => {
    const username = control.value?.trim();

    if (!username || username.length < 3 || username === currentUsername) {
      return of(null);
    }

    return timer(300).pipe(
      switchMap(() => userAuth.checkUniqueUsername(username)),
      map((isUnique) => (isUnique ? null : { usernameTaken: true })),
      catchError(() => of(null)),
    );
  };
};

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, RouterModule, ConfirmPopupModule, ToastModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  standalone: true,
  providers: [ConfirmationService, MessageService],
})
export class Settings {
  private formBuilder = inject(FormBuilder);
  private userAuth = inject(UserAuth);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  submitted = false;
  isDeletingAccount = false;
  settingsSearch = '';

  usernameForm = this.formBuilder.group({
    newUsername: this.formBuilder.control(this.userAuth.username() ?? '', {
      validators: [Validators.required, Validators.minLength(3)],
      asyncValidators: [uniqueUsernameValidator(this.userAuth, this.userAuth.username())],
      updateOn: 'blur',
    }),
  });

  hasError(controlName: string, errorName: string): boolean {
    const control = this.usernameForm.get(controlName);
    return !!control && control.hasError(errorName) && (control.touched || this.submitted);
  }

  get isCheckingUsername(): boolean {
    return this.usernameForm.get('newUsername')?.pending ?? false;
  }

  get isUsernameAvailable(): boolean {
    const control = this.newUsernameControl;
    const username = control?.value?.trim();

    return !!(
      control &&
      username &&
      username.length >= 3 &&
      !control.errors &&
      !control.pending &&
      control.touched &&
      username !== this.userAuth.username()
    );
  }

  get newUsernameControl() {
    return this.usernameForm.get('newUsername');
  }

  updateSettingsSearch(event: Event) {
    this.settingsSearch = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  shouldShowCard(title: string): boolean {
    if (!this.settingsSearch) {
      return true;
    }

    return title.toLowerCase().includes(this.settingsSearch);
  }

  onSubmit() {
    this.submitted = true;

    if (this.usernameForm.invalid) {
      this.usernameForm.markAllAsTouched();
      return;
    }
  }

  confirmDeleteAccount(event: Event) {
    event.stopPropagation();

    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Do you really want to delete your account? This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Keep Account',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete Account',
        severity: 'danger',
      },
      accept: () => {
        this.deleteMyAccount();
      },
    });
  }

  private deleteMyAccount() {
    const userId = this.userAuth.userId();

    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Delete failed',
        detail: 'User information is missing. Please log in again.',
        life: 3000,
      });
      return;
    }

    this.isDeletingAccount = true;

    this.userAuth.deleteUser(userId).subscribe({
      next: (isDeleted) => {
        this.isDeletingAccount = false;

        if (!isDeleted) {
          this.messageService.add({
            severity: 'error',
            summary: 'Delete failed',
            detail: 'We could not delete your account right now.',
            life: 3000,
          });
          return;
        }

        this.userAuth.isAuthenticated.set(false);
        this.userAuth.userId.set(null);
        this.userAuth.username.set(null);

        this.messageService.add({
          severity: 'success',
          summary: 'Account deleted',
          detail: 'Your account has been removed successfully.',
          life: 2500,
        });

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1600);
      },
      error: () => {
        this.isDeletingAccount = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Delete failed',
          detail: 'Something went wrong while deleting your account.',
          life: 3000,
        });
      },
    });
  }
}
