import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviornments/env.dev';

export interface CommentRequestDto {
  messageId: number;
  comment: string;
  userId: string | number;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private httpclient = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  GetAllComments(): Observable<any> {
    return this.httpclient.get<any>(`${this.baseUrl}/messages/getAllMessages`);
  }

  ReactToComment(reactData: any): Observable<any> {
    return this.httpclient.post<any>(`${this.baseUrl}/messages/react`, reactData);
  }

  CommentOnMessage(commentData: CommentRequestDto): Observable<any> {
    return this.httpclient.post<any>(`${this.baseUrl}/messages/commentOnMessage`, commentData);
  }

  GetCommentsByMessageId(messageid: number): Observable<any> {
    return this.httpclient.get<any>(`${this.baseUrl}/messages/getComments/${messageid}`);
  }
}
