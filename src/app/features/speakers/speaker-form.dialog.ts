import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SpeakerRequest, SpeakerResponse } from '../../core/models/speaker';

export interface SpeakerFormDialogData {
  speaker?: SpeakerResponse;
}

@Component({
  selector: 'app-speaker-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data?.speaker ? 'Edit speaker' : 'Add speaker' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title / position</mat-label>
          <input matInput formControlName="titlePosition" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Company</mat-label>
          <input matInput formControlName="company" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Bio</mat-label>
          <textarea matInput rows="3" formControlName="bio"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Photo URL</mat-label>
          <input matInput formControlName="photoUrl" placeholder="https://..." />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Website URL</mat-label>
          <input matInput formControlName="websiteUrl" placeholder="https://..." />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Linked user ID (optional)</mat-label>
          <input matInput type="number" formControlName="userId" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form { display: flex; flex-direction: column; gap: 4px; min-width: 380px; }
      .full-width { width: 100%; }
    `,
  ],
})
export class SpeakerFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SpeakerFormDialogComponent>);
  readonly data = inject<SpeakerFormDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    titlePosition: [''],
    company: [''],
    bio: [''],
    photoUrl: [''],
    websiteUrl: [''],
    userId: [null as number | null],
  });

  constructor() {
    const s = this.data?.speaker;
    if (s) {
      this.form.patchValue({
        name: s.name,
        titlePosition: s.titlePosition ?? '',
        company: s.company ?? '',
        bio: s.bio ?? '',
        photoUrl: s.photoUrl ?? '',
        websiteUrl: s.websiteUrl ?? '',
        userId: s.userId,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const req: SpeakerRequest = {
      name: v.name.trim(),
      titlePosition: v.titlePosition?.trim() || null,
      company: v.company?.trim() || null,
      bio: v.bio?.trim() || null,
      photoUrl: v.photoUrl?.trim() || null,
      websiteUrl: v.websiteUrl?.trim() || null,
      userId: v.userId == null ? null : Number(v.userId),
    };
    this.dialogRef.close(req);
  }
}
