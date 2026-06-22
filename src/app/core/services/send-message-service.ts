import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviornments/env.dev';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interface/Interfaces';

@Injectable({
  providedIn: 'root',
})
export class SendMessageService {
  private httpclient = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  SendMessage(formData: any): Observable<ApiResponse<number>> {
    return this.httpclient.post<ApiResponse<number>>(`${this.baseUrl}/send-message/sendMessage`, formData);
  }
}
