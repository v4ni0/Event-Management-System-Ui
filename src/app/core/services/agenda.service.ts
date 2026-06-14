import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AgendaItemRequest, AgendaItemResponse } from '../models/agenda-item';
import { API_BASE_URL } from '../util/api-base';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);

  list(eventId: number): Observable<AgendaItemResponse[]> {
    return this.http.get<AgendaItemResponse[]>(`${API_BASE_URL}/events/${eventId}/agenda`);
  }

  create(eventId: number, req: AgendaItemRequest): Observable<AgendaItemResponse> {
    return this.http.post<AgendaItemResponse>(`${API_BASE_URL}/events/${eventId}/agenda`, req);
  }

  update(eventId: number, id: number, req: AgendaItemRequest): Observable<AgendaItemResponse> {
    return this.http.put<AgendaItemResponse>(
      `${API_BASE_URL}/events/${eventId}/agenda/${id}`,
      req,
    );
  }

  delete(eventId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/events/${eventId}/agenda/${id}`);
  }

  reorder(eventId: number, orderedIds: number[]): Observable<AgendaItemResponse[]> {
    return this.http.patch<AgendaItemResponse[]>(
      `${API_BASE_URL}/events/${eventId}/agenda/reorder`,
      orderedIds,
    );
  }
}
