import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AnalyticsService } from '../../core/services/analytics.service';
import { EventService } from '../../core/services/event.service';
import { AttendancePoint, EventAnalyticsResponse } from '../../core/models/analytics';
import { EventResponse } from '../../core/models/event';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { formatDateTime } from '../../core/util/date';

@Component({
  selector: 'app-analytics-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './analytics-dashboard.page.html',
  styleUrl: './analytics-dashboard.page.css',
})
export class AnalyticsDashboardPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AnalyticsService);
  private readonly events = inject(EventService);

  readonly eventId = signal<number>(0);
  readonly loading = signal(false);
  readonly event = signal<EventResponse | null>(null);
  readonly analytics = signal<EventAnalyticsResponse | null>(null);
  readonly attendance = signal<AttendancePoint[]>([]);
  readonly format = formatDateTime;

  readonly chartWidth = 800;
  readonly chartHeight = 260;
  readonly padding = 32;

  readonly bars = computed(() => {
    const data = this.attendance();
    if (!data.length) return [];
    const maxCount = Math.max(1, ...data.map((d) => d.count));
    const innerW = this.chartWidth - this.padding * 2;
    const innerH = this.chartHeight - this.padding * 2;
    const slot = innerW / data.length;
    const w = Math.max(8, slot * 0.7);
    return data.map((d, i) => {
      const h = (d.count / maxCount) * innerH;
      const x = this.padding + slot * i + (slot - w) / 2;
      const y = this.chartHeight - this.padding - h;
      const shortDay = d.day.slice(5); // MM-DD
      return { ...d, x, y, w, h, shortDay };
    });
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventId.set(id);
    this.loading.set(true);
    this.events.getById(id).subscribe((e) => this.event.set(e));
    this.api.dashboard(id).subscribe({
      next: (a) => {
        this.analytics.set(a);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.api.attendance(id).subscribe((rows) => this.attendance.set(rows));
  }
}
