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
  templateUrl: './feedback-list.component.html',
  styleUrl: './feedback-list.component.css',
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
