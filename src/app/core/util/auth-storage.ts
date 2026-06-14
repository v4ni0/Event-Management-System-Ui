// Auth-aware localStorage with SSR-safe guards.
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

const KEY = 'eventplatform.auth';

export interface AuthStorageValue {
  token: string;
  user: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthStorage {
  private readonly platformId = inject(PLATFORM_ID);
  private get available(): boolean {
    return isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
  }

  read(): AuthStorageValue | null {
    if (!this.available) return null;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthStorageValue) : null;
    } catch {
      return null;
    }
  }

  write(value: AuthStorageValue): void {
    if (!this.available) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      /* quota exceeded — ignore */
    }
  }

  clear(): void {
    if (!this.available) return;
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}
