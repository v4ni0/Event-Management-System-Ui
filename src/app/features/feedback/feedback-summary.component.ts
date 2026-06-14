import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeedbackService } from '../../core/services/feedback.service';
import { FeedbackSummaryResponse } from '../../core/models/feedback';

@Component({
  selector: 'app-feedback-summary',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="center-spinner"><mat-spinner diameter="24"></mat-spinner></div>
    } @else if (summary(); as s) {
      <div class="summary">
        <div class="overall">
          <div class="big">{{ overall() }}</div>
          <div class="stars">
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <mat-icon [class.filled]="overallNumber() >= n">
                {{ overallNumber() >= n ? 'star' : 'star_border' }}
              </mat-icon>
            }
          </div>
          <div class="count text-muted text-small">{{ s.totalCount }} reviews</div>
        </div>
        <div class="breakdown">
          @if (s.averageVenueRating != null) {
            <div class="row"><span>Venue</span><strong>{{ formatScore(s.averageVenueRating) }}</strong></div>
          }
          @if (s.averageContentRating != null) {
            <div class="row"><span>Content</span><strong>{{ formatScore(s.averageContentRating) }}</strong></div>
          }
          @if (s.averageOrganizationRating != null) {
            <div class="row"><span>Organization</span><strong>{{ formatScore(s.averageOrganizationRating) }}</strong></div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .summary {
        display: flex;
        gap: 32px;
        padding: 16px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
        flex-wrap: wrap;
      }
      .overall { display: flex; flex-direction: column; align-items: center; min-width: 120px; }
      .big { font-size: 2.4rem; font-weight: 600; line-height: 1.1; }
      .stars { display: inline-flex; }
      .stars mat-icon { color: var(--mat-sys-outline); font-size: 20px; width: 20px; height: 20px; }
      .stars mat-icon.filled { color: #f5b400; }
      .breakdown { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 200px; }
      .row { display: flex; justify-content: space-between; gap: 16px; }
    `,
  ],
})
export class FeedbackSummaryComponent implements OnInit {
  readonly eventId = input.required<number>();
  private readonly api = inject(FeedbackService);
  readonly loading = signal(false);
  readonly summary = signal<FeedbackSummaryResponse | null>(null);

  overall(): string {
    const v = this.summary()?.averageOverallRating;
    return v == null ? '—' : v.toFixed(1);
  }
  overallNumber(): number {
    return Math.round(this.summary()?.averageOverallRating ?? 0);
  }
  formatScore(v: number | null | undefined): string {
    return v == null ? '—' : v.toFixed(1);
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.api.summary(this.eventId()).subscribe({
      next: (s) => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
