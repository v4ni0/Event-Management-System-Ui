import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, tap, finalize, of, catchError } from 'rxjs';
import { Router } from '@angular/router';

import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth';
import { User } from '../models/user';
import { UserRole } from '../models/enums';
import { API_BASE_URL } from '../util/api-base';
import { AuthStorage } from '../util/auth-storage';
import { isJwtExpired } from '../util/jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(AuthStorage);
  private readonly router = inject(Router);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  readonly currentUserSignal = signal<User | null>(null);

  readonly isLoggedIn$: Observable<boolean> = new Observable((sub) => {
    const onChange = (u: User | null) => sub.next(u != null);
    onChange(this.currentUserSubject.value);
    const inner = this.currentUserSubject.subscribe(onChange);
    return () => inner.unsubscribe();
  });

  readonly role$: Observable<UserRole | null> = new Observable((sub) => {
    const emit = (u: User | null) => sub.next(u ? u.role : null);
    emit(this.currentUserSubject.value);
    const inner = this.currentUserSubject.subscribe(emit);
    return () => inner.unsubscribe();
  });

  readonly roleSignal = computed(() => this.currentUserSignal()?.role ?? null);

  private cachedToken: string | null = null;

  constructor() {
    this.hydrate();
  }

  private hydrate(): void {
    const stored = this.storage.read();
    if (!stored) return;
    if (isJwtExpired(stored.token)) {
      this.storage.clear();
      return;
    }
    this.cachedToken = stored.token;
    const u = stored.user as User;
    this.currentUserSubject.next(u);
    this.currentUserSignal.set(u);
  }

  get token(): string | null {
    return this.cachedToken;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasAnyRole(...roles: UserRole[]): boolean {
    const u = this.currentUserSubject.value;
    return !!u && roles.includes(u.role);
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, req).pipe(
      tap((resp) => this.storeSession(resp)),
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, req).pipe(
      tap((resp) => this.storeSession(resp)),
    );
  }

  logout(): Observable<void> {
    const hadToken = !!this.cachedToken;
    const obs: Observable<void> = hadToken
      ? this.http.post<void>(`${API_BASE_URL}/auth/logout`, {}).pipe(catchError(() => of(void 0)))
      : of(void 0);
    return obs.pipe(
      finalize(() => {
        this.clearSession();
      }),
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/reset-password`, { token, newPassword });
  }

  /** Local-only logout used by the error interceptor on 401s. */
  clearSession(): void {
    this.storage.clear();
    this.cachedToken = null;
    this.currentUserSubject.next(null);
    this.currentUserSignal.set(null);
  }

  private storeSession(resp: AuthResponse): void {
    this.storage.write({ token: resp.token, user: resp.user });
    this.cachedToken = resp.token;
    this.currentUserSubject.next(resp.user);
    this.currentUserSignal.set(resp.user);
  }
}
