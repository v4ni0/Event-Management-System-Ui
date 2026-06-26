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
  templateUrl: './feedback-summary.component.html',
  styleUrl: './feedback-summary.component.css',
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
