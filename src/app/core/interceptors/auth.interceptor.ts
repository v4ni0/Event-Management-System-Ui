import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../util/api-base';

/**
 * Adds Authorization: Bearer <token> to requests targeted at our API.
 * Skips auth/login and auth/register since the user is not yet authenticated there.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  const isApiCall = req.url.startsWith(API_BASE_URL);
  const isPublicAuth =
    req.url === `${API_BASE_URL}/auth/login` || req.url === `${API_BASE_URL}/auth/register`;

  if (token && isApiCall && !isPublicAuth) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
