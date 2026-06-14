import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Page } from '../models/page';
import { User, UserUpdateRequest } from '../models/user';
import { API_BASE_URL } from '../util/api-base';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/users/me`);
  }

  updateMe(req: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${API_BASE_URL}/users/me`, req);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/users/${id}`);
  }

  list(page = 0, size = 20): Observable<Page<User>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<User>>(`${API_BASE_URL}/users`, { params });
  }
}
