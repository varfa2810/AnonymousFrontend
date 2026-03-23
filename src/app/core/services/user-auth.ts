import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../enviornments/env.dev';
import { catchError, map, Observable, of, tap } from 'rxjs';

interface BooleanApiResponse {
  data: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserAuth {
  private httpclient = inject(HttpClient);
  private baseUrl = environment.baseUrl;
  isAuthenticated = signal(false);

  userId = signal<string | number | null>(null);
  username = signal<string | null>(null);

  login(data: any): Observable<any> {
    return this.httpclient
      .post<any>(`${this.baseUrl}/auth/login`, data)
      .pipe(tap(() => this.isAuthenticated.set(true)));
  }

  logout(): Observable<any> {
    return this.httpclient.post<any>(`${this.baseUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.isAuthenticated.set(false);
        this.userId.set(null);
        this.username.set(null);
      }),
    );
  }

  checkSession() {
    return this.httpclient.get<any>(`${this.baseUrl}/auth/WhoAmI`, { withCredentials: true }).pipe(
      tap((res) => {
        this.isAuthenticated.set(true);
        this.userId.set(res.userId);
        this.username.set(res.username);
      }),
      catchError(() => {
        this.isAuthenticated.set(false);
        return of(null);
      }),
    );
  }

  checkUniqueUsername(username: string): Observable<boolean> {
    return this.httpclient
      .get<BooleanApiResponse>(
        `${this.baseUrl}/auth/CheckUniqueUsername?username=${encodeURIComponent(username)}`,
      )
      .pipe(
        map((res) => !res.data),
        catchError((err) => {
          if (err.status === 404) {
            return of(true);
          }

          console.error('Username check failed', err);
          return of(false);
        }),
      );
  }

  deleteUser(userId: string | number): Observable<boolean> {
    return this.httpclient
      .delete<BooleanApiResponse | boolean>(`${this.baseUrl}/auth/deleteUser/${userId}`)
      .pipe(
        map((res) => (typeof res === 'boolean' ? res : !!res.data)),
        catchError((err) => {
          console.error('Delete user failed', err);
          return of(false);
        }),
      );
  }

}
