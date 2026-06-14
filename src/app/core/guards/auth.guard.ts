import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/enums';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser) return true;
  router.navigate(['/login']);
  return false;
};

export function roleGuard(...allowed: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const snack = inject(MatSnackBar);
    if (!auth.currentUser) {
      router.navigate(['/login']);
      return false;
    }
    if (allowed.includes(auth.currentUser.role)) return true;
    snack.open('You do not have permission to access that page.', 'Dismiss', { duration: 4000 });
    router.navigate(['/']);
    return false;
  };
}
