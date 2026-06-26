import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TicketRequest, TicketResponse } from '../../core/models/ticket';
import { toBackendDateTime } from '../../core/util/date';

export interface TicketFormDialogData {
  ticket?: TicketResponse;
}

@Component({
  selector: 'app-ticket-form-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
  templateUrl: './ticket-form.dialog.html',
  styleUrl: './ticket-form.dialog.css',
})
export class TicketFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketFormDialogComponent>);
  readonly data = inject<TicketFormDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    quantityAvailable: [50, [Validators.required, Validators.min(1)]],
    saleStart: [null as Date | null],
    saleEnd: [null as Date | null],
  });

  constructor() {
    const t = this.data?.ticket;
    if (t) {
      this.form.patchValue({
        name: t.name,
        description: t.description ?? '',
        price: Number(t.price),
        quantityAvailable: t.quantityAvailable,
        saleStart: t.saleStart ? new Date(t.saleStart) : null,
        saleEnd: t.saleEnd ? new Date(t.saleEnd) : null,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const req: TicketRequest = {
      name: v.name.trim(),
      description: v.description?.trim() || null,
      price: Number(v.price),
      quantityAvailable: Number(v.quantityAvailable),
      saleStart: toBackendDateTime(v.saleStart),
      saleEnd: toBackendDateTime(v.saleEnd),
    };
    this.dialogRef.close(req);
  }
}
