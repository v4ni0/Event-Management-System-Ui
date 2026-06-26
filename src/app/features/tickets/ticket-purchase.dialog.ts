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
  templateUrl: './ticket-purchase.dialog.html',
  styleUrl: './ticket-purchase.dialog.css',
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
