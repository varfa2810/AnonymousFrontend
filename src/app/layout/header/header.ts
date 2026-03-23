import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserAuth } from '../../core/services/user-auth';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
  selector: 'app-header',
  imports: [RouterModule, ConfirmPopupModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  providers: [ConfirmationService],
})
export class Header {
  private authService = inject(UserAuth);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  username = this.authService.username;
  userid = this.authService.userId;
  isNavbarOpen = false;
  isUserMenuOpen = false;

  @HostListener('document:click')
  closeMenus() {
    this.isNavbarOpen = false;
    this.isUserMenuOpen = false;
  }

  toggleNavbar(event: MouseEvent) {
    event.stopPropagation();
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onNavClick() {
    this.isNavbarOpen = false;
    this.isUserMenuOpen = false;
  }

  onCommentsNavClick(event: Event) {
    this.onNavClick();

    if (this.router.url.startsWith('/comments')) {
      event.preventDefault();
      this.router
        .navigateByUrl('/request', { skipLocationChange: true })
        .then(() => this.router.navigate(['/comments']));
    }
  }

  logout(event: Event) {
    event.stopPropagation();

    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Are you sure you want to logout from your account?',
      icon: 'pi pi-sign-out',
      rejectButtonProps: {
        label: 'Stay',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Logout',
        severity: 'danger',
      },
      accept: () => {
        this.onNavClick();
        this.authService.logout().subscribe({
          next: (res) => {
            if (res.data == true) {
              this.router.navigate(['/login']);
            }
          },
          error: (err) => {
            console.error('logout failed', err);
          },
        });
      },
    });
  }
}
