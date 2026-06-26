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
  templateUrl: './event-summary.component.html',
  styleUrl: './event-summary.component.css',
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
