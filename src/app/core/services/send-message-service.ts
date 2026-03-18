import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviornments/env.dev';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SendMessageService {
  private httpclient = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  SendMessage(formData: any): Observable<any> {
    return this.httpclient.post<any>(`${this.baseUrl}/send-message/sendMessage`, formData);
  }
}
