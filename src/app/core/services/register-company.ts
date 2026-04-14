import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviornments/env.dev';
import { Observable } from 'rxjs';
import { ApiResponse, RegisterCompanyDto } from '../interface/Interfaces';

@Injectable({
  providedIn: 'root',
})
export class RegisterCompany {
  private httpclient = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  registerCompany(data: RegisterCompanyDto): Observable<ApiResponse<string>> {
    return this.httpclient.post<ApiResponse<string>>(
      `${this.baseUrl}/register-company/RegisterCompany`,
      data,
    );
  }
}
