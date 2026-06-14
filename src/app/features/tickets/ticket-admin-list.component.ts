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
  template: `
    <div class="header">
      <h3>Ticket types</h3>
      <button mat-flat-button color="primary" (click)="add()">
        <mat-icon>add</mat-icon> Add ticket
      </button>
    </div>

    @if (loading()) {
      <div class="center-spinner"><mat-spinner diameter="32"></mat-spinner></div>
    } @else if (tickets().length) {
      <table mat-table [dataSource]="tickets()" class="full-width">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let t">
            <strong>{{ t.name }}</strong>
            @if (t.description) {
              <div class="text-muted text-small">{{ t.description }}</div>
            }
          </td>
        </ng-container>
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let t">{{ t.price | number: '1.2-2' }}</td>
        </ng-container>
        <ng-container matColumnDef="sold">
          <th mat-header-cell *matHeaderCellDef>Sold / Available</th>
          <td mat-cell *matCellDef="let t">{{ t.quantitySold }} / {{ t.quantityAvailable }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let t"><app-status-chip [status]="t.status"></app-status-chip></td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let t">
            <button mat-icon-button (click)="edit(t)" aria-label="Edit"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button (click)="remove(t)" aria-label="Delete"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols"></tr>
      </table>
    } @else {
      <app-empty-state
        icon="local_activity"
        title="No tickets yet"
        message="Add a ticket type to start selling."
      ></app-empty-state>
    }
  `,
  styles: [
    `
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .header h3 { margin: 0; font-weight: 500; }
      table { width: 100%; }
    `,
  ],
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
