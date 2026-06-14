import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { TicketResponse } from '../../core/models/ticket';
import { EventResponse } from '../../core/models/event';

export interface TicketPurchaseDialogData {
  event: EventResponse;
  tickets: TicketResponse[];
}

@Component({
  selector: 'app-ticket-purchase-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Get a ticket — {{ data.event.title }}</h2>
    <mat-dialog-content>
      <p class="muted">Choose a ticket type:</p>
      <mat-radio-group [formControl]="ticketIdControl" class="radio-list">
        @for (t of available; track t.id) {
          <mat-radio-button [value]="t.id" class="radio-row">
            <div class="row-content">
              <div>
                <strong>{{ t.name }}</strong>
                @if (t.description) {
                  <div class="muted small">{{ t.description }}</div>
                }
              </div>
              <div class="price">{{ t.price | number: '1.2-2' }}</div>
            </div>
          </mat-radio-button>
        }
      </mat-radio-group>
      @if (!available.length) {
        <p class="muted">No tickets are currently on sale for this event.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!ticketIdControl.value"
        (click)="confirm()"
      >
        Confirm
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content { min-width: 360px; }
      .radio-list { display: flex; flex-direction: column; gap: 6px; }
      .radio-row { padding: 8px 0; }
      .row-content {
        display: inline-flex;
        gap: 16px;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      .price { font-weight: 600; }
      .muted { color: var(--mat-sys-on-surface-variant); }
      .small { font-size: 0.85rem; }
    `,
  ],
})
export class TicketPurchaseDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketPurchaseDialogComponent>);
  readonly data = inject<TicketPurchaseDialogData>(MAT_DIALOG_DATA);

  readonly available = (this.data.tickets ?? []).filter((t) => t.status === 'AVAILABLE');
  readonly ticketIdControl = this.fb.control<number | null>(null, [Validators.required]);

  confirm(): void {
    if (!this.ticketIdControl.value) return;
    this.dialogRef.close(this.ticketIdControl.value);
  }
}
