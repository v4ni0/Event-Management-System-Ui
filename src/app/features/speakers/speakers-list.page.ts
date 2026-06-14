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
  template: `
    <div class="page-container wide">
      <app-page-header title="Speakers" subtitle="People presenting at our events.">
        <ng-container actions>
          @if (canCreate()) {
            <button mat-flat-button color="primary" (click)="add()">
              <mat-icon>add</mat-icon> Add speaker
            </button>
          }
        </ng-container>
      </app-page-header>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (speakers().length) {
        <div class="grid">
          @for (s of speakers(); track s.id) {
            <mat-card class="speaker-card" [routerLink]="['/speakers', s.id]">
              @if (s.photoUrl) {
                <img [src]="s.photoUrl" [alt]="s.name" class="photo" />
              } @else {
                <div class="photo placeholder">
                  <mat-icon>person</mat-icon>
                </div>
              }
              <mat-card-content>
                <h3>{{ s.name }}</h3>
                @if (s.titlePosition) {
                  <p class="title">{{ s.titlePosition }}</p>
                }
                @if (s.company) {
                  <p class="company text-muted text-small">{{ s.company }}</p>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <app-empty-state
          icon="record_voice_over"
          title="No speakers yet"
          message="Add speakers to showcase their bios."
        ></app-empty-state>
      }
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
      .speaker-card { cursor: pointer; overflow: hidden; }
      .photo {
        width: 100%;
        height: 180px;
        object-fit: cover;
      }
      .photo.placeholder {
        background: var(--mat-sys-surface-variant);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .photo.placeholder mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--mat-sys-on-surface-variant);
      }
      h3 { margin: 4px 0; font-size: 1.05rem; font-weight: 500; }
      .title { margin: 0; font-size: 0.9rem; }
      .company { margin: 4px 0 0; }
    `,
  ],
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
