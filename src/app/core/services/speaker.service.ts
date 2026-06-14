import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  PresentationMaterialResponse,
  SpeakerRequest,
  SpeakerResponse,
} from '../models/speaker';
import { API_BASE_URL } from '../util/api-base';

@Injectable({ providedIn: 'root' })
export class SpeakerService {
  private readonly http = inject(HttpClient);

  list(): Observable<SpeakerResponse[]> {
    return this.http.get<SpeakerResponse[]>(`${API_BASE_URL}/speakers`);
  }

  get(id: number): Observable<SpeakerResponse> {
    return this.http.get<SpeakerResponse>(`${API_BASE_URL}/speakers/${id}`);
  }

  create(req: SpeakerRequest): Observable<SpeakerResponse> {
    return this.http.post<SpeakerResponse>(`${API_BASE_URL}/speakers`, req);
  }

  update(id: number, req: SpeakerRequest): Observable<SpeakerResponse> {
    return this.http.put<SpeakerResponse>(`${API_BASE_URL}/speakers/${id}`, req);
  }

  listMaterials(id: number): Observable<PresentationMaterialResponse[]> {
    return this.http.get<PresentationMaterialResponse[]>(
      `${API_BASE_URL}/speakers/${id}/materials`,
    );
  }

  uploadMaterial(
    speakerId: number,
    file: File,
    agendaItemId?: number | null,
  ): Observable<PresentationMaterialResponse> {
    const form = new FormData();
    form.append('file', file);
    let params = new HttpParams();
    if (agendaItemId != null) params = params.set('agendaItemId', agendaItemId);
    return this.http.post<PresentationMaterialResponse>(
      `${API_BASE_URL}/speakers/${speakerId}/materials`,
      form,
      { params },
    );
  }
}
