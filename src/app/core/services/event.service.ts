import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { EventListFilters, EventRequest, EventResponse, EventSummaryResponse } from '../models/event';
import { EventStatus } from '../models/enums';
import { Page } from '../models/page';
import { API_BASE_URL } from '../util/api-base';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);

  list(filters: EventListFilters = {}): Observable<Page<EventResponse>> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.city) params = params.set('city', filters.city);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    params = params.set('page', filters.page ?? 0).set('size', filters.size ?? 12);
    if (filters.sort) params = params.set('sort', filters.sort);
    return this.http.get<Page<EventResponse>>(`${API_BASE_URL}/events`, { params });
  }

  getById(id: number): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${API_BASE_URL}/events/${id}`);
  }

  getSummary(id: number): Observable<EventSummaryResponse> {
    return this.http.get<EventSummaryResponse>(`${API_BASE_URL}/events/${id}/summary`);
  }

  create(req: EventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${API_BASE_URL}/events`, req);
  }

  update(id: number, req: EventRequest): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${API_BASE_URL}/events/${id}`, req);
  }

  changeStatus(id: number, status: EventStatus): Observable<EventResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<EventResponse>(`${API_BASE_URL}/events/${id}/status`, null, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/events/${id}`);
  }
}
