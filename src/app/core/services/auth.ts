import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../enviornments/env.dev';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { ApiResponse, UserProfileResponseDto } from '../interface/Interfaces';


export interface CurrentUser {
  userId: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private httpclient = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  currentUser = signal<CurrentUser | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  isSuperAdmin = computed(() => this.currentUser()?.role === 'SuperAdmin');
  isCompanyAdmin = computed(() => this.currentUser()?.role === 'CompanyAdmin');
  isEmployee = computed(() => this.currentUser()?.role === 'Employee');

  login(data: any): Observable<any> {
    return this.httpclient
      .post<any>(`${this.baseUrl}/auth/login`, data)
      .pipe(
        switchMap(() => this.checkSession())
      );
  }

  logout(): Observable<ApiResponse<boolean>> {
    return this.httpclient.post<ApiResponse<boolean>>(`${this.baseUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
      }),
    );
  }

  checkSession(): Observable<any> {
    return this.httpclient.get<any>(`${this.baseUrl}/auth/WhoAmI`).pipe(
      tap((user) => {
        this.currentUser.set(user);
      }),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }

  checkUniqueUsername(username: string): Observable<ApiResponse<boolean>> {
    return this.httpclient.get<ApiResponse<boolean>>(
      `${this.baseUrl}/auth/CheckUniqueUsername?username=${encodeURIComponent(username)}`
    );
  }

  deleteUser(userId: string): Observable<ApiResponse<any>> {
    return this.httpclient
      .delete<ApiResponse<any>>(`${this.baseUrl}/auth/deleteUser/${encodeURIComponent(userId)}`);
  }

  getUserProfile(userId: string): Observable<ApiResponse<UserProfileResponseDto>> {
    return this.httpclient.get<ApiResponse<UserProfileResponseDto>>(
      `${this.baseUrl}/auth/profile/${encodeURIComponent(userId)}`
    );
  }

}
