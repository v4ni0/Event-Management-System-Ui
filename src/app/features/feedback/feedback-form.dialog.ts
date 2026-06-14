import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FeedbackRequest } from '../../core/models/feedback';

export interface FeedbackFormDialogData {
  eventTitle: string;
}

@Component({
  selector: 'app-feedback-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Rate "{{ data.eventTitle }}"</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <div class="rating-row">
          <span class="rating-label">Overall</span>
          <span class="stars">
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <button
                type="button"
                mat-icon-button
                (click)="form.controls.overallRating.setValue(n)"
                [attr.aria-label]="n + ' stars'"
              >
                <mat-icon class="star" [class.filled]="(form.controls.overallRating.value ?? 0) >= n">
                  {{ (form.controls.overallRating.value ?? 0) >= n ? 'star' : 'star_border' }}
                </mat-icon>
              </button>
            }
          </span>
        </div>
        <div class="rating-row">
          <span class="rating-label">Venue</span>
          <span class="stars">
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <button
                type="button"
                mat-icon-button
                (click)="form.controls.venueRating.setValue(n)"
                [attr.aria-label]="n + ' stars'"
              >
                <mat-icon class="star" [class.filled]="(form.controls.venueRating.value ?? 0) >= n">
                  {{ (form.controls.venueRating.value ?? 0) >= n ? 'star' : 'star_border' }}
                </mat-icon>
              </button>
            }
          </span>
        </div>
        <div class="rating-row">
          <span class="rating-label">Content</span>
          <span class="stars">
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <button
                type="button"
                mat-icon-button
                (click)="form.controls.contentRating.setValue(n)"
                [attr.aria-label]="n + ' stars'"
              >
                <mat-icon class="star" [class.filled]="(form.controls.contentRating.value ?? 0) >= n">
                  {{ (form.controls.contentRating.value ?? 0) >= n ? 'star' : 'star_border' }}
                </mat-icon>
              </button>
            }
          </span>
        </div>
        <div class="rating-row">
          <span class="rating-label">Organization</span>
          <span class="stars">
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <button
                type="button"
                mat-icon-button
                (click)="form.controls.organizationRating.setValue(n)"
                [attr.aria-label]="n + ' stars'"
              >
                <mat-icon class="star" [class.filled]="(form.controls.organizationRating.value ?? 0) >= n">
                  {{ (form.controls.organizationRating.value ?? 0) >= n ? 'star' : 'star_border' }}
                </mat-icon>
              </button>
            }
          </span>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Comment</mat-label>
          <textarea matInput rows="3" formControlName="comment"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="save()"
      >
        Submit feedback
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form { display: flex; flex-direction: column; gap: 8px; min-width: 360px; }
      .rating-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .rating-label { color: var(--mat-sys-on-surface); font-weight: 500; }
      .stars { display: inline-flex; }
      .star { color: var(--mat-sys-outline); }
      .star.filled { color: #f5b400; }
      .full-width { width: 100%; }
    `,
  ],
})
export class FeedbackFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FeedbackFormDialogComponent>);
  readonly data = inject<FeedbackFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    overallRating: [null as number | null, [Validators.required, Validators.min(1), Validators.max(5)]],
    venueRating: [null as number | null],
    contentRating: [null as number | null],
    organizationRating: [null as number | null],
    comment: [''],
  });

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const req: FeedbackRequest = {
      overallRating: v.overallRating!,
      comment: v.comment?.trim() || null,
      venueRating: v.venueRating,
      contentRating: v.contentRating,
      organizationRating: v.organizationRating,
    };
    this.dialogRef.close(req);
  }
}
