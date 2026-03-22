import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { environment } from '../enviornments/env.dev';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { UserAuth } from './core/services/user-auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly env = signal(environment.envName);

  private authService = inject(UserAuth);
  private router = inject(Router);
  isAuthenticated = this.authService.isAuthenticated;

  isImmersiveRoute(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') || url.startsWith('/register');
  }

  isWideRoute(): boolean {
    return (
      this.router.url.startsWith('/about') ||
      this.router.url.startsWith('/rules') ||
      this.router.url.startsWith('/request')
    );
  }

  getRouteShellClass(): string {
    if (this.isImmersiveRoute()) {
      return 'app-route-shell app-route-shell--immersive';
    }

    if (this.isWideRoute()) {
      return 'app-route-shell app-route-shell--wide';
    }

    return 'container py-4';
  }
}
