import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SpeakerRequest, SpeakerResponse } from '../../core/models/speaker';
import { ImageUploadComponent } from '../../shared/image-upload.component';

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
    ImageUploadComponent
  ],
  templateUrl: './speaker-form.dialog.html',
  styleUrl: './speaker-form.dialog.css',
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
