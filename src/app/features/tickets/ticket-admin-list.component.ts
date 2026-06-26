import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TicketService } from '../../core/services/ticket.service';
import { TicketResponse } from '../../core/models/ticket';
import { TicketFormDialogComponent } from './ticket-form.dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { StatusChipComponent } from '../../shared/status-chip.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-ticket-admin-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatusChipComponent,
    EmptyStateComponent,
  ],
  templateUrl: './ticket-admin-list.component.html',
  styleUrl: './ticket-admin-list.component.css',
})
export class TicketAdminListComponent implements OnInit {
  readonly eventId = input.required<number>();

  private readonly ticketsApi = inject(TicketService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly tickets = signal<TicketResponse[]>([]);
  readonly loading = signal(false);
  readonly cols = ['name', 'price', 'sold', 'status', 'actions'];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.ticketsApi.list(this.eventId()).subscribe({
      next: (list) => {
        this.tickets.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  add(): void {
    const ref = this.dialog.open(TicketFormDialogComponent, { data: {} });
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.ticketsApi.create(this.eventId(), req).subscribe({
        next: () => {
          this.snack.open('Ticket added', 'OK', { duration: 2000 });
          this.refresh();
        },
      });
    });
  }

  edit(ticket: TicketResponse): void {
    const ref = this.dialog.open(TicketFormDialogComponent, { data: { ticket } });
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.ticketsApi.update(this.eventId(), ticket.id, req).subscribe({
        next: () => {
          this.snack.open('Ticket updated', 'OK', { duration: 2000 });
          this.refresh();
        },
      });
    });
  }

  remove(ticket: TicketResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete ticket?',
        message: `Remove ticket "${ticket.name}"?`,
        destructive: true,
        confirmText: 'Delete',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.ticketsApi.delete(this.eventId(), ticket.id).subscribe({
        next: () => {
          this.snack.open('Ticket deleted', 'OK', { duration: 2000 });
          this.refresh();
        },
      });
    });
  }
}
