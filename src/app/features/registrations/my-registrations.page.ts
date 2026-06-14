import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationResponse } from '../../core/models/registration';
import { Page } from '../../core/models/page';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { StatusChipComponent } from '../../shared/status-chip.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { formatDateTime } from '../../core/util/date';

@Component({
  selector: 'app-my-registrations-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
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
      <app-page-header title="My tickets" subtitle="Your event registrations."></app-page-header>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (page()?.content?.length) {
        <mat-card>
          <table mat-table [dataSource]="page()!.content" class="full-width">
            <ng-container matColumnDef="confirmation">
              <th mat-header-cell *matHeaderCellDef>Confirmation</th>
              <td mat-cell *matCellDef="let r"><code>{{ r.confirmationCode }}</code></td>
            </ng-container>
            <ng-container matColumnDef="event">
              <th mat-header-cell *matHeaderCellDef>Event</th>
              <td mat-cell *matCellDef="let r">
                <a [routerLink]="['/events', r.eventId]">View event</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="registered">
              <th mat-header-cell *matHeaderCellDef>Registered</th>
              <td mat-cell *matCellDef="let r">{{ format(r.registeredAt) }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r">
                <app-status-chip [status]="r.status"></app-status-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r">
                @if (r.status === 'CONFIRMED') {
                  <button mat-button color="warn" (click)="cancel(r)">Cancel</button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>
          </table>
        </mat-card>
        <mat-paginator
          [length]="page()!.totalElements"
          [pageSize]="page()!.size"
          [pageIndex]="page()!.number"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
        ></mat-paginator>
      } @else {
        <app-empty-state
          icon="confirmation_number"
          title="No tickets yet"
          message="Browse events and grab a ticket."
        >
          <a mat-flat-button color="primary" routerLink="/events">Browse events</a>
        </app-empty-state>
      }
    </div>
  `,
  styles: [
    `
      mat-card { padding: 0; overflow: hidden; }
      table { width: 100%; }
      mat-paginator { background: transparent; margin-top: 8px; }
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
export class MyRegistrationsPage implements OnInit {
  private readonly api = inject(RegistrationService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly page = signal<Page<RegistrationResponse> | null>(null);
  readonly cols = ['confirmation', 'event', 'registered', 'status', 'actions'];
  readonly format = formatDateTime;

  private currentPage = 0;
  private pageSize = 20;

  ngOnInit(): void {
    this.fetch();
  }

  onPage(ev: PageEvent): void {
    this.currentPage = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.api.listMine(this.currentPage, this.pageSize).subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancel(reg: RegistrationResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel registration?',
        message: 'You can re-register if seats are still available.',
        destructive: true,
        confirmText: 'Cancel registration',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.api.cancel(reg.id).subscribe({
        next: () => {
          this.snack.open('Registration cancelled', 'OK', { duration: 2000 });
          this.fetch();
        },
      });
    });
  }
}
