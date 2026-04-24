import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviornments/env.dev';
import { ApiResponse, CompanySummary } from '../interface/Interfaces';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminService {
  private httpclient = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  GetAllCompanyDetails(): Observable<ApiResponse<CompanySummary[]>> {
    return this.httpclient.get<ApiResponse<CompanySummary[]>>(
      `${this.baseUrl}/super-admin/company-details`,
    );
  }

  GetAllCompanyDetailsWithId(companyId: number | string): Observable<ApiResponse<CompanySummary>> {
    return this.httpclient.get<ApiResponse<CompanySummary>>(
      `${this.baseUrl}/super-admin/GetAllCompanyDetailsWithId/${companyId}`,
    );
  }

  ApproveCompany(companyId: number | string, action : boolean): Observable<ApiResponse<boolean | string>> {
    return this.httpclient.post<ApiResponse<boolean | string>>(
      `${this.baseUrl}/super-admin/action`,
      { companyId, action},
    );
  }
}
