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
  templateUrl: './my-registrations.page.html',
  styleUrl: './my-registrations.page.css',
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
