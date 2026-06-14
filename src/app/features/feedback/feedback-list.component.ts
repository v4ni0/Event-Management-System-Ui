import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeedbackService } from '../../core/services/feedback.service';
import { FeedbackResponse } from '../../core/models/feedback';
import { formatDateTime } from '../../core/util/date';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, EmptyStateComponent],
  template: `
    @if (loading()) {
      <div class="center-spinner"><mat-spinner diameter="32"></mat-spinner></div>
    } @else if (rows().length) {
      <ul class="reviews">
        @for (f of rows(); track f.id) {
          <li class="review">
            <div class="head">
              <div class="stars">
                @for (n of [1, 2, 3, 4, 5]; track n) {
                  <mat-icon [class.filled]="f.overallRating >= n">
                    {{ f.overallRating >= n ? 'star' : 'star_border' }}
                  </mat-icon>
                }
              </div>
              <span class="when text-muted text-small">{{ format(f.submittedAt) }}</span>
            </div>
            @if (f.comment) {
              <p>{{ f.comment }}</p>
            }
            <div class="sub-ratings text-muted text-small">
              @if (f.venueRating) {
                <span>Venue: {{ f.venueRating }}/5</span>
              }
              @if (f.contentRating) {
                <span>Content: {{ f.contentRating }}/5</span>
              }
              @if (f.organizationRating) {
                <span>Organization: {{ f.organizationRating }}/5</span>
              }
            </div>
          </li>
        }
      </ul>
    } @else {
      <app-empty-state
        icon="rate_review"
        title="No feedback yet"
        message="Once attendees submit reviews, they will appear here."
      ></app-empty-state>
    }
  `,
  styles: [
    `
      .reviews { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
      .review {
        padding: 16px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
      }
      .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .stars mat-icon { color: var(--mat-sys-outline); font-size: 20px; width: 20px; height: 20px; }
      .stars mat-icon.filled { color: #f5b400; }
      p { margin: 0 0 8px; }
      .sub-ratings { display: flex; gap: 12px; flex-wrap: wrap; }
    `,
  ],
})
export class FeedbackListComponent implements OnInit {
  readonly eventId = input.required<number>();
  private readonly api = inject(FeedbackService);
  readonly loading = signal(false);
  readonly rows = signal<FeedbackResponse[]>([]);
  readonly format = formatDateTime;

  ngOnInit(): void {
    this.loading.set(true);
    this.api.list(this.eventId()).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
