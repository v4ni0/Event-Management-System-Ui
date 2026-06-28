import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AttendancePoint, EventAnalyticsResponse } from '../models/analytics';
import { API_BASE_URL } from '../util/api-base';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  
  private readonly http = inject(HttpClient);

  dashboard(eventId: number): Observable<EventAnalyticsResponse> {
    return this.http.get<EventAnalyticsResponse>(`${API_BASE_URL}/events/${eventId}/analytics`);
  }

  attendance(eventId: number): Observable<AttendancePoint[]> {
    return this.http.get<AttendancePoint[]>(
      `${API_BASE_URL}/events/${eventId}/analytics/attendance`,
    );
  }
}
