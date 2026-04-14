import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  isAuthenticated = this.authService.isAuthenticated;
}
