import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-settings',
  imports: [RouterModule, ConfirmPopupModule, ToastModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  standalone: true,
  providers: [ConfirmationService, MessageService],
})
export class Settings {
  private userAuth = inject(Auth);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  isDeletingAccount = false;
  settingsSearch = '';
  isSuperAdmin = this.userAuth.isSuperAdmin();

  updateSettingsSearch(event: Event) {
    this.settingsSearch = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  shouldShowCard(title: string): boolean {
    if (!this.settingsSearch) {
      return true;
    }

    return title.toLowerCase().includes(this.settingsSearch);
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
    const userId = this.userAuth.currentUser()?.userId;

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

        this.userAuth.currentUser.set(null);

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
