import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../enviornments/env.dev';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { Auth } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly env = signal(environment.envName);
  private authService = inject(Auth);
  protected readonly isAuthenticated = this.authService.isAuthenticated;
}
