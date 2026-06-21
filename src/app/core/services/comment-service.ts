import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviornments/env.dev';
import { ApiResponse, CommentResponseDto, MessageDto, ReactToMessageDto } from '../interface/Interfaces';

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

  GetAllComments(): Observable<ApiResponse<MessageDto[]>> {
    return this.httpclient.get<ApiResponse<MessageDto[]>>(
      `${this.baseUrl}/messages/getAllMessages`
    );
  }

  ReactToComment(reactData: ReactToMessageDto): Observable<ApiResponse<boolean>> {
    return this.httpclient.post<ApiResponse<boolean>>(`${this.baseUrl}/messages/react`, reactData);
  }

  CommentOnMessage(commentData: CommentRequestDto): Observable<ApiResponse<boolean>> {
    return this.httpclient.post<ApiResponse<boolean>>(`${this.baseUrl}/messages/commentOnMessage`, commentData);
  }

  GetCommentsByMessageId(messageid: number): Observable<ApiResponse<CommentResponseDto[]>> {
    return this.httpclient.get<ApiResponse<CommentResponseDto[]>>(`${this.baseUrl}/messages/getComments/${messageid}`);
  }
}
