import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  FeedbackRequest,
  FeedbackResponse,
  FeedbackSummaryResponse,
} from '../models/feedback';
import { API_BASE_URL } from '../util/api-base';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly http = inject(HttpClient);

  submit(eventId: number, req: FeedbackRequest): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(`${API_BASE_URL}/events/${eventId}/feedback`, req);
  }

  list(eventId: number): Observable<FeedbackResponse[]> {
    return this.http.get<FeedbackResponse[]>(`${API_BASE_URL}/events/${eventId}/feedback`);
  }

  summary(eventId: number): Observable<FeedbackSummaryResponse> {
    return this.http.get<FeedbackSummaryResponse>(
      `${API_BASE_URL}/events/${eventId}/feedback/summary`,
    );
  }

  aiSummary(eventId: number): Observable<string> {
    return this.http.get(`${API_BASE_URL}/events/${eventId}/feedback/ai-summary`, {
      responseType: 'text',
    });
  }
}
