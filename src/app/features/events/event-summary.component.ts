import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventService } from '../../core/services/event.service';
import { EventSummaryResponse } from '../../core/models/event';
import { prettyEnum } from '../../core/models/enums';

@Component({
  selector: 'app-event-summary',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="center-spinner"><mat-spinner diameter="24"></mat-spinner></div>
    } @else if (summary(); as s) {
      <div class="grid">
        <div class="tile">
          <div class="tile-label">Registrations</div>
          <div class="tile-value">{{ s.totalRegistrations }}</div>
        </div>
        <div class="tile">
          <div class="tile-label">Check-ins</div>
          <div class="tile-value">{{ s.totalCheckIns }}</div>
        </div>
        <div class="tile">
          <div class="tile-label">Available capacity</div>
          <div class="tile-value">{{ s.availableCapacity }}</div>
        </div>
        <div class="tile">
          <div class="tile-label">Ticket types</div>
          <div class="tile-value">{{ s.ticketTypesCount }}</div>
        </div>
        <div class="tile">
          <div class="tile-label">Avg rating</div>
          <div class="tile-value">{{ s.averageRating != null ? (s.averageRating | number: '1.1-1') : '—' }}</div>
        </div>
        <div class="tile">
          <div class="tile-label">Revenue</div>
          <div class="tile-value">{{ s.revenue != null ? (s.revenue | number: '1.2-2') : '—' }}</div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
      }
      .tile {
        background: var(--mat-sys-surface-variant);
        padding: 12px 14px;
        border-radius: 8px;
      }
      .tile-label {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .tile-value { font-size: 1.4rem; font-weight: 600; margin-top: 4px; }
    `,
  ],
})
export class EventSummaryComponent implements OnInit {
  readonly eventId = input.required<number>();
  private readonly api = inject(EventService);
  readonly loading = signal(false);
  readonly summary = signal<EventSummaryResponse | null>(null);
  readonly pretty = prettyEnum;

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getSummary(this.eventId()).subscribe({
      next: (s) => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
