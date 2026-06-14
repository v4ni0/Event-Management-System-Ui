import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { UserRole } from '../core/models/enums';

@Component({
  selector: 'app-role-chip',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <mat-chip [highlighted]="true" [class]="'role role-' + role().toLowerCase()" disableRipple>
      {{ label() }}
    </mat-chip>
  `,
  styles: [
    `
      :host { display: inline-flex; }
      ::ng-deep .role { font-size: 0.72rem; min-height: 22px; }
      ::ng-deep .role-admin { background: #b71c1c; color: #fff; }
      ::ng-deep .role-organizer { background: #1565c0; color: #fff; }
      ::ng-deep .role-speaker { background: #6a1b9a; color: #fff; }
      ::ng-deep .role-attendee { background: #2e7d32; color: #fff; }
    `,
  ],
})
export class RoleChipComponent {
  readonly role = input.required<UserRole>();
  readonly label = computed(() => {
    const r = this.role();
    return r.charAt(0) + r.slice(1).toLowerCase();
  });
}
