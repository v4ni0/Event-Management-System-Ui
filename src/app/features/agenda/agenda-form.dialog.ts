import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { AgendaItemRequest, AgendaItemResponse } from '../../core/models/agenda-item';
import { AGENDA_ITEM_TYPES, AgendaItemType, prettyEnum } from '../../core/models/enums';
import { SpeakerResponse } from '../../core/models/speaker';
import { toBackendDateTime } from '../../core/util/date';

export interface AgendaFormDialogData {
  item?: AgendaItemResponse;
  speakers: SpeakerResponse[];
}

@Component({
  selector: 'app-agenda-form-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
  templateUrl: './agenda-form.dialog.html',
  styleUrl: './agenda-form.dialog.css',
})
export class AgendaFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AgendaFormDialogComponent>);
  readonly data = inject<AgendaFormDialogData>(MAT_DIALOG_DATA);

  readonly types = AGENDA_ITEM_TYPES;
  readonly pretty = prettyEnum;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    type: [null as AgendaItemType | null],
    speakerId: [null as number | null],
    startDate: [null as Date | null, [Validators.required]],
    startTime: ['09:00', [Validators.required]],
    endDate: [null as Date | null, [Validators.required]],
    endTime: ['10:00', [Validators.required]],
    locationRoom: [''],
  });

  constructor() {
    const it = this.data.item;
    if (it) {
      const start = it.startTime ? new Date(it.startTime) : null;
      const end = it.endTime ? new Date(it.endTime) : null;
      this.form.patchValue({
        title: it.title,
        description: it.description ?? '',
        type: it.type,
        speakerId: it.speakerId,
        startDate: start,
        startTime: start ? toHHMM(start) : '09:00',
        endDate: end,
        endTime: end ? toHHMM(end) : '10:00',
        locationRoom: it.locationRoom ?? '',
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const startISO = combine(v.startDate!, v.startTime);
    const endISO = combine(v.endDate!, v.endTime);
    if (!startISO || !endISO) return;
    const req: AgendaItemRequest = {
      title: v.title.trim(),
      description: v.description?.trim() || null,
      speakerId: v.speakerId,
      startTime: startISO,
      endTime: endISO,
      locationRoom: v.locationRoom?.trim() || null,
      type: v.type,
    };
    this.dialogRef.close(req);
  }
}

function toHHMM(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function combine(date: Date, time: string): string | null {
  if (!date || !time) return null;
  const [h, m] = time.split(':').map((n) => Number(n));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const merged = new Date(date);
  merged.setHours(h, m, 0, 0);
  return toBackendDateTime(merged);
}
