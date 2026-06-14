import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../core/services/auth.service';
import { RoleChipComponent } from '../shared/role-chip.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RoleChipComponent,
  ],
  templateUrl: 'navbar.component.html',
  styleUrl: 'navbar.component.css',
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly user = this.auth.currentUserSignal;
  readonly displayName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}`.trim() || u.email : '';
  });
  readonly canCreateEvents = computed(() => {
    const role = this.user()?.role;
    return role === 'ORGANIZER' || role === 'ADMIN';
  });
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  protected searchQuery = '';
  protected location = '';

  onSearch(): void {
    const queryParams: Record<string, string | null> = {
      city: this.location || null,
    };
    if (this.searchQuery) {
      queryParams['q'] = this.searchQuery;
    }
    this.router.navigate(['/events'], { queryParams });
  }

  signOut(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.snack.open('Signed out', 'OK', { duration: 2000 });
        this.router.navigate(['/']);
      },
    });
  }
}
