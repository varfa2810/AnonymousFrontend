import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviornments/env.dev';
import { ApiResponse, CompanySummaryDto } from '../interface/Interfaces';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminService {
  private httpclient = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  GetAllCompanyDetails(): Observable<ApiResponse<CompanySummaryDto[]>> {
    return this.httpclient.get<ApiResponse<CompanySummaryDto[]>>(
      `${this.baseUrl}/super-admin/company-details`,
    );
  }

  GetAllCompanyDetailsWithId(companyId: number | string): Observable<ApiResponse<CompanySummaryDto>> {
    return this.httpclient.get<ApiResponse<CompanySummaryDto>>(
      `${this.baseUrl}/super-admin/GetAllCompanyDetailsWithId/${companyId}`,
    );
  }

  ApproveCompany(companyId: number | string, action : boolean): Observable<ApiResponse<number>> {
    return this.httpclient.post<ApiResponse<number>>(
      `${this.baseUrl}/super-admin/action`,
      { companyId, action},
    );
  }
}
