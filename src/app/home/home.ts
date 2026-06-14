import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EventService } from '../core/services/event.service';
import { EventResponse } from '../core/models/event';
import { StatusChipComponent } from '../shared/status-chip.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { formatDateTime } from '../core/util/date';
import { prettyEnum } from '../core/models/enums';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    StatusChipComponent,
    EmptyStateComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly eventsApi = inject(EventService);
  readonly loading = signal(false);
  readonly events = signal<EventResponse[]>([]);
  readonly format = formatDateTime;
  readonly pretty = prettyEnum;

  ngOnInit(): void {
    this.loading.set(true);
    this.eventsApi.list({ status: 'PUBLISHED', size: 6, page: 0 }).subscribe({
      next: (page) => {
        this.events.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
