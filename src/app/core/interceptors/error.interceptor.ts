import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

import { ErrorResponse } from '../models/error-response';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 → kick to login.
      if (err.status === 401) {
        auth.clearSession();
        if (!req.url.includes('/auth/')) {
          snack.open('Your session expired. Please sign in again.', 'Dismiss', { duration: 4000 });
          router.navigate(['/login']);
        }
        return throwError(() => err);
      }

      // Try to surface backend ErrorResponse.message; fall back gracefully.
      const body = err.error as Partial<ErrorResponse> | string | null | undefined;
      let message: string | null = null;
      if (body && typeof body === 'object' && 'message' in body && body.message) {
        message = String(body.message);
      } else if (typeof body === 'string' && body.trim()) {
        message = body;
      } else if (err.status === 0) {
        message = 'Cannot reach the server. Is the backend running on port 8080?';
      } else if (err.message) {
        message = err.message;
      }

      if (message) {
        snack.open(message, 'Dismiss', { duration: 5000 });
      }
      return throwError(() => err);
    }),
  );
};
