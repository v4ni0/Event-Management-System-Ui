import { CommonModule} from '@angular/common';
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
    RoleChipComponent,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: 'navbar.component.html',
  styleUrl: 'navbar.component.css',
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  protected city = '';

  readonly user = this.auth.currentUserSignal;
  readonly displayName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}`.trim() || user.email : '';
  });

  readonly canCreateEvents = computed(() => {
    const role = this.user()?.role;
    return role === 'ORGANIZER' || role === 'ADMIN';
  });

  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  onSearch() : void {
    this.router.navigate(['/events'], { queryParams: { city: this.city || null } });
  }

  signOut() : void {
    this.auth.logout().subscribe({                                                                                                             
      next: () => {                                                                                                                            
        this.snack.open('Signed out', 'OK', { duration: 2000 });                                                                               
        this.router.navigate(['/']);
      }
    });
  }
}
