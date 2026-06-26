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
  templateUrl: './status-chip.component.html',
  styleUrl: './status-chip.component.css',
})
export class StatusChipComponent {
  readonly status = input.required<AnyStatus>();
  readonly label = computed(() => prettyEnum(this.status()));
}
