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
  templateUrl: './materials-upload.dialog.html',
  styleUrl: './materials-upload.dialog.css',
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
