import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_BASE_URL } from '../util/api-base';

interface UploadResponse {
    url: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
    private readonly http = inject(HttpClient);

    uploadImage(file: File): Observable<string> {
        const form = new FormData();
        form.append('file', file);
        return this.http
            .post<UploadResponse>(`${API_BASE_URL}/uploads/images`, form)
            .pipe(map((r) => r.url));
    }
}