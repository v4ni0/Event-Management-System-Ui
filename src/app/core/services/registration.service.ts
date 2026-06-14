import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Page } from '../models/page';
import { RegistrationRequest, RegistrationResponse } from '../models/registration';
import { API_BASE_URL } from '../util/api-base';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);

  register(eventId: number, req: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      `${API_BASE_URL}/events/${eventId}/registrations`,
      req,
    );
  }

  listForEvent(eventId: number): Observable<RegistrationResponse[]> {
    return this.http.get<RegistrationResponse[]>(
      `${API_BASE_URL}/events/${eventId}/registrations`,
    );
  }

  get(id: number): Observable<RegistrationResponse> {
    return this.http.get<RegistrationResponse>(`${API_BASE_URL}/registrations/${id}`);
  }

  cancel(id: number): Observable<RegistrationResponse> {
    return this.http.patch<RegistrationResponse>(
      `${API_BASE_URL}/registrations/${id}/cancel`,
      {},
    );
  }

  checkIn(id: number): Observable<RegistrationResponse> {
    return this.http.patch<RegistrationResponse>(
      `${API_BASE_URL}/registrations/${id}/check-in`,
      {},
    );
  }

  listMine(page = 0, size = 20): Observable<Page<RegistrationResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<RegistrationResponse>>(
      `${API_BASE_URL}/users/me/registrations`,
      { params },
    );
  }
}
