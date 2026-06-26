import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { UserRole } from '../core/models/enums';

@Component({
  selector: 'app-role-chip',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './role-chip.component.html',
  styleUrl: './role-chip.component.css',
})
export class RoleChipComponent {
  readonly role = input.required<UserRole>();
  readonly label = computed(() => {
    const r = this.role();
    return r.charAt(0) + r.slice(1).toLowerCase();
  });
}
