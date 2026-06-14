import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TicketRequest, TicketResponse } from '../models/ticket';
import { API_BASE_URL } from '../util/api-base';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);

  list(eventId: number): Observable<TicketResponse[]> {
    return this.http.get<TicketResponse[]>(`${API_BASE_URL}/events/${eventId}/tickets`);
  }

  get(eventId: number, ticketId: number): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${API_BASE_URL}/events/${eventId}/tickets/${ticketId}`);
  }

  create(eventId: number, req: TicketRequest): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(`${API_BASE_URL}/events/${eventId}/tickets`, req);
  }

  update(eventId: number, ticketId: number, req: TicketRequest): Observable<TicketResponse> {
    return this.http.put<TicketResponse>(
      `${API_BASE_URL}/events/${eventId}/tickets/${ticketId}`,
      req,
    );
  }

  delete(eventId: number, ticketId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/events/${eventId}/tickets/${ticketId}`);
  }
}
