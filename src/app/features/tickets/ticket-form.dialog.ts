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
  template: `
    <h2 mat-dialog-title>{{ data?.ticket ? 'Edit ticket' : 'Add ticket' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="ticket-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput rows="2" formControlName="description"></textarea>
        </mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Price</mat-label>
            <input matInput type="number" min="0" step="0.01" formControlName="price" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" min="1" formControlName="quantityAvailable" />
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Sale starts</mat-label>
            <input matInput [matDatepicker]="startP" formControlName="saleStart" />
            <mat-datepicker-toggle matSuffix [for]="startP"></mat-datepicker-toggle>
            <mat-datepicker #startP></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Sale ends</mat-label>
            <input matInput [matDatepicker]="endP" formControlName="saleEnd" />
            <mat-datepicker-toggle matSuffix [for]="endP"></mat-datepicker-toggle>
            <mat-datepicker #endP></mat-datepicker>
          </mat-form-field>
        </div>
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
        Save
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .ticket-form { display: flex; flex-direction: column; gap: 4px; min-width: 360px; }
      .row { display: flex; gap: 12px; }
      .row > * { flex: 1; }
      .full-width { width: 100%; }
    `,
  ],
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
