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
  templateUrl: './event-registrations.page.html',
  styleUrl: './event-registrations.page.css',
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
