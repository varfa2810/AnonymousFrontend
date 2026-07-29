import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { UserProfileResponseDto } from '../../core/interface/Interfaces';

@Component({
  selector: 'app-profile',
  imports: [RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  standalone: true,
})
export class Profile {
  private auth = inject(Auth);

  isLoading = signal(true);
  loadError = signal('');
  profile = signal<UserProfileResponseDto | null>(null);
  showUsername = signal(true);

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId;

    if (!userId) {
      this.loadError.set('Your session is missing. Please log in again.');
      this.isLoading.set(false);
      return;
    }

    this.auth.getUserProfile(userId).subscribe({
      next: (res) => {
        this.profile.set(res?.data ?? null);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('We could not load your profile right now.');
        this.isLoading.set(false);
      },
    });
  }

  toggleUsernameVisibility(): void {
    this.showUsername.update((value) => !value);
  }

  getDisplayUsername(username: string): string {
    if (this.showUsername()) {
      return username;
    }

    if (username.length <= 2) {
      return '*'.repeat(username.length);
    }

    return `${username.slice(0, 1)}${'*'.repeat(Math.max(username.length - 2, 1))}${username.slice(-1)}`;
  }
}
