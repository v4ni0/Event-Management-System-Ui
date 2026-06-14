import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import {
  EventStatus,
  RegistrationStatus,
  TicketStatus,
  prettyEnum,
} from '../core/models/enums';

type AnyStatus = EventStatus | RegistrationStatus | TicketStatus;

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <mat-chip [highlighted]="true" [class]="'sc sc-' + status().toLowerCase().replace('_', '-')" disableRipple>
      {{ label() }}
    </mat-chip>
  `,
  styles: [
    `
      :host { display: inline-flex; }
      ::ng-deep .sc { font-size: 0.72rem; min-height: 22px; }
      ::ng-deep .sc-published, ::ng-deep .sc-confirmed, ::ng-deep .sc-available {
        background: #2e7d32; color: #fff;
      }
      ::ng-deep .sc-draft { background: #757575; color: #fff; }
      ::ng-deep .sc-cancelled { background: #b71c1c; color: #fff; }
      ::ng-deep .sc-completed { background: #1565c0; color: #fff; }
      ::ng-deep .sc-checked-in { background: #6a1b9a; color: #fff; }
      ::ng-deep .sc-sold-out, ::ng-deep .sc-sale-ended { background: #ef6c00; color: #fff; }
    `,
  ],
})
export class StatusChipComponent {
  readonly status = input.required<AnyStatus>();
  readonly label = computed(() => prettyEnum(this.status()));
}
