import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpeakerService } from '../../core/services/speaker.service';

export interface MaterialsUploadDialogData {
  speakerId: number;
}

@Component({
  selector: 'app-materials-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Upload material</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <label class="file-picker">
          <input
            type="file"
            (change)="onFile($event)"
            accept=".pdf,.ppt,.pptx,.key,.zip,.png,.jpg,.jpeg"
          />
          @if (file()) {
            <span><mat-icon>description</mat-icon>{{ file()!.name }}</span>
          } @else {
            <span><mat-icon>cloud_upload</mat-icon>Choose file…</span>
          }
        </label>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Agenda item ID (optional)</mat-label>
          <input matInput type="number" formControlName="agendaItemId" />
        </mat-form-field>
        <p class="muted small">
          Note: backend stores files via Cloudinary. If not configured, upload will fail with a
          server message.
        </p>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!file() || saving()"
        (click)="save()"
      >
        @if (saving()) { <mat-spinner diameter="18"></mat-spinner> } @else { Upload }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form { display: flex; flex-direction: column; gap: 8px; min-width: 360px; }
      .file-picker {
        border: 1px dashed var(--mat-sys-outline);
        border-radius: 8px;
        padding: 14px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .file-picker input { display: none; }
      .full-width { width: 100%; }
      .muted { color: var(--mat-sys-on-surface-variant); }
      .small { font-size: 0.85rem; }
    `,
  ],
})
export class MaterialsUploadDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<MaterialsUploadDialogComponent>);
  private readonly api = inject(SpeakerService);
  private readonly snack = inject(MatSnackBar);
  readonly data = inject<MaterialsUploadDialogData>(MAT_DIALOG_DATA);

  readonly file = signal<File | null>(null);
  readonly saving = signal(false);
  readonly form = this.fb.nonNullable.group({
    agendaItemId: [null as number | null],
  });

  onFile(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    this.file.set(target.files?.[0] ?? null);
  }

  save(): void {
    const f = this.file();
    if (!f) return;
    this.saving.set(true);
    this.api
      .uploadMaterial(this.data.speakerId, f, this.form.value.agendaItemId ?? null)
      .subscribe({
        next: (m) => {
          this.saving.set(false);
          this.snack.open('Material uploaded', 'OK', { duration: 2000 });
          this.dialogRef.close(m);
        },
        error: () => this.saving.set(false),
      });
  }
}
