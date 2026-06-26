import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SpeakerService } from '../../core/services/speaker.service';
import { SpeakerResponse } from '../../core/models/speaker';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { SpeakerFormDialogComponent } from './speaker-form.dialog';

@Component({
  selector: 'app-speakers-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './speakers-list.page.html',
  styleUrl: './speakers-list.page.css',
})
export class SpeakersListPage implements OnInit {
  private readonly api = inject(SpeakerService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly speakers = signal<SpeakerResponse[]>([]);
  readonly loading = signal(false);

  canCreate(): boolean {
    return this.auth.hasAnyRole('ORGANIZER', 'SPEAKER', 'ADMIN');
  }

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (rows) => {
        this.speakers.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  add(): void {
    const ref = this.dialog.open(SpeakerFormDialogComponent, { data: {} });
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.api.create(req).subscribe({
        next: () => {
          this.snack.open('Speaker created', 'OK', { duration: 2000 });
          this.fetch();
        },
      });
    });
  }
}
