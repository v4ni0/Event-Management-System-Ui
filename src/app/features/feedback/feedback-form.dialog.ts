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
  templateUrl: './feedback-form.dialog.html',
  styleUrl: './feedback-form.dialog.css',
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
