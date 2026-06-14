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
  template: `
    <div class="page-container wide">
      <app-page-header
        [title]="'Analytics — ' + (event()?.title ?? '')"
        subtitle="Live counts. Refreshes when you reload."
      >
        <a mat-button [routerLink]="['/events', eventId()]">Back to event</a>
      </app-page-header>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (analytics(); as a) {
        <div class="tiles">
          <mat-card><div class="t-label">Registrations</div><div class="t-value">{{ a.totalRegistrations }}</div></mat-card>
          <mat-card><div class="t-label">Check-ins</div><div class="t-value">{{ a.totalCheckIns }}</div></mat-card>
          <mat-card><div class="t-label">Cancellations</div><div class="t-value">{{ a.totalCancellations }}</div></mat-card>
          <mat-card><div class="t-label">Feedback</div><div class="t-value">{{ a.totalFeedback }}</div></mat-card>
          <mat-card>
            <div class="t-label">Avg rating</div>
            <div class="t-value">{{ a.averageRating != null ? (a.averageRating | number: '1.1-1') : '—' }}</div>
          </mat-card>
          <mat-card>
            <div class="t-label">Revenue</div>
            <div class="t-value">{{ a.revenue != null ? (a.revenue | number: '1.2-2') : '—' }}</div>
          </mat-card>
        </div>

        <mat-card class="chart-card">
          <h3>Registrations over time</h3>
          @if (attendance().length) {
            <svg
              [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight"
              [attr.width]="chartWidth"
              [attr.height]="chartHeight"
              preserveAspectRatio="xMidYMid meet"
              class="chart"
            >
              <line
                [attr.x1]="padding"
                [attr.y1]="chartHeight - padding"
                [attr.x2]="chartWidth - padding"
                [attr.y2]="chartHeight - padding"
                stroke="currentColor"
                stroke-opacity="0.4"
              />
              <line
                [attr.x1]="padding"
                [attr.y1]="padding"
                [attr.x2]="padding"
                [attr.y2]="chartHeight - padding"
                stroke="currentColor"
                stroke-opacity="0.4"
              />
              @for (b of bars(); track b.day) {
                <g>
                  <rect
                    [attr.x]="b.x"
                    [attr.y]="b.y"
                    [attr.width]="b.w"
                    [attr.height]="b.h"
                    fill="var(--mat-sys-primary)"
                    rx="3"
                  />
                  <text
                    [attr.x]="b.x + b.w / 2"
                    [attr.y]="chartHeight - padding + 14"
                    text-anchor="middle"
                    font-size="10"
                    fill="currentColor"
                    fill-opacity="0.7"
                  >{{ b.shortDay }}</text>
                  <text
                    [attr.x]="b.x + b.w / 2"
                    [attr.y]="b.y - 4"
                    text-anchor="middle"
                    font-size="10"
                    fill="currentColor"
                  >{{ b.count }}</text>
                </g>
              }
            </svg>
          } @else {
            <app-empty-state
              icon="bar_chart"
              title="No attendance data yet"
              message="Once people register, you will see daily counts."
            ></app-empty-state>
          }
        </mat-card>

        <p class="text-muted text-small">Computed at: {{ format(a.computedAt) }}</p>
      }
    </div>
  `,
  styles: [
    `
      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      mat-card { padding: 16px; }
      .t-label {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .t-value { font-size: 1.6rem; font-weight: 600; margin-top: 4px; }
      .chart-card { padding: 24px; }
      .chart-card h3 { margin: 0 0 16px; font-weight: 500; }
      .chart { display: block; width: 100%; height: auto; }
    `,
  ],
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
