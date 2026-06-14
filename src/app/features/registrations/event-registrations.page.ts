import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationResponse } from '../../core/models/registration';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { StatusChipComponent } from '../../shared/status-chip.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { formatDateTime } from '../../core/util/date';

@Component({
  selector: 'app-event-registrations-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    PageHeaderComponent,
    StatusChipComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header
        title="Registrations"
        subtitle="Check in attendees as they arrive."
      >
        <a mat-button [routerLink]="['/events', eventId()]">Back to event</a>
      </app-page-header>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (rows().length) {
        <mat-card>
          <table mat-table [dataSource]="rows()" class="full-width">
            <ng-container matColumnDef="confirmation">
              <th mat-header-cell *matHeaderCellDef>Confirmation</th>
              <td mat-cell *matCellDef="let r"><code>{{ r.confirmationCode }}</code></td>
            </ng-container>
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User #</th>
              <td mat-cell *matCellDef="let r">{{ r.userId }}</td>
            </ng-container>
            <ng-container matColumnDef="ticket">
              <th mat-header-cell *matHeaderCellDef>Ticket #</th>
              <td mat-cell *matCellDef="let r">{{ r.ticketId }}</td>
            </ng-container>
            <ng-container matColumnDef="registered">
              <th mat-header-cell *matHeaderCellDef>Registered</th>
              <td mat-cell *matCellDef="let r">{{ format(r.registeredAt) }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r"><app-status-chip [status]="r.status"></app-status-chip></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r">
                @if (r.status === 'CONFIRMED') {
                  <button mat-flat-button color="primary" (click)="checkIn(r)">
                    <mat-icon>how_to_reg</mat-icon> Check in
                  </button>
                } @else if (r.status === 'CHECKED_IN') {
                  <span class="muted">Checked in {{ format(r.checkedInAt) }}</span>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>
          </table>
        </mat-card>
      } @else {
        <app-empty-state
          icon="how_to_reg"
          title="No registrations yet"
          message="Once attendees buy tickets, they will appear here."
        ></app-empty-state>
      }
    </div>
  `,
  styles: [
    `
      mat-card { padding: 0; overflow: hidden; }
      table { width: 100%; }
      .muted { color: var(--mat-sys-on-surface-variant); font-size: 0.85rem; }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        background: var(--mat-sys-surface-variant);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class EventRegistrationsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(RegistrationService);
  private readonly snack = inject(MatSnackBar);

  readonly eventId = signal<number>(0);
  readonly loading = signal(false);
  readonly rows = signal<RegistrationResponse[]>([]);
  readonly cols = ['confirmation', 'user', 'ticket', 'registered', 'status', 'actions'];
  readonly format = formatDateTime;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventId.set(id);
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.api.listForEvent(this.eventId()).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  checkIn(r: RegistrationResponse): void {
    this.api.checkIn(r.id).subscribe({
      next: () => {
        this.snack.open('Checked in', 'OK', { duration: 2000 });
        this.fetch();
      },
    });
  }
}
