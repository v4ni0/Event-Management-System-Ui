import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SpeakerService } from '../../core/services/speaker.service';
import { SpeakerResponse, PresentationMaterialResponse } from '../../core/models/speaker';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { SpeakerFormDialogComponent } from './speaker-form.dialog';
import { MaterialsUploadDialogComponent } from './materials-upload.dialog';
import { formatDateTime } from '../../core/util/date';

@Component({
  selector: 'app-speaker-detail-page',
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
    <div class="page-container">
      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (speaker(); as s) {
        <app-page-header [title]="s.name" [subtitle]="s.titlePosition || ''">
          <ng-container actions>
            <a mat-button routerLink="/speakers">All speakers</a>
            @if (canEdit()) {
              <button mat-stroked-button (click)="edit()">
                <mat-icon>edit</mat-icon> Edit
              </button>
              <button mat-flat-button color="primary" (click)="upload()">
                <mat-icon>cloud_upload</mat-icon> Upload material
              </button>
            }
          </ng-container>
        </app-page-header>

        <div class="grid">
          <mat-card class="profile">
            @if (s.photoUrl) {
              <img [src]="s.photoUrl" [alt]="s.name" class="photo" />
            } @else {
              <div class="photo placeholder">
                <mat-icon>person</mat-icon>
              </div>
            }
            <mat-card-content>
              @if (s.company) {
                <p><strong>{{ s.company }}</strong></p>
              }
              @if (s.bio) {
                <p>{{ s.bio }}</p>
              }
              @if (s.websiteUrl) {
                <a [href]="s.websiteUrl" target="_blank" rel="noopener">
                  <mat-icon>open_in_new</mat-icon> {{ s.websiteUrl }}
                </a>
              }
            </mat-card-content>
          </mat-card>

          <div class="materials">
            <h3>Materials</h3>
            @if (loadingMats()) {
              <div class="center-spinner"><mat-spinner diameter="32"></mat-spinner></div>
            } @else if (materials().length) {
              <ul class="material-list">
                @for (m of materials(); track m.id) {
                  <li>
                    <mat-icon>description</mat-icon>
                    <a [href]="m.fileUrl" target="_blank" rel="noopener">{{ m.fileName }}</a>
                    <span class="text-muted text-small">{{ m.fileType }} · {{ format(m.uploadedAt) }}</span>
                  </li>
                }
              </ul>
            } @else {
              <app-empty-state icon="description" title="No materials yet"></app-empty-state>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 24px;
        align-items: start;
      }
      @media (max-width: 720px) {
        .grid { grid-template-columns: 1fr; }
      }
      .profile { padding: 0; overflow: hidden; }
      .photo {
        width: 100%;
        height: 280px;
        object-fit: cover;
        background: var(--mat-sys-surface-variant);
      }
      .photo.placeholder { display: flex; align-items: center; justify-content: center; }
      .photo.placeholder mat-icon {
        font-size: 96px;
        width: 96px;
        height: 96px;
        color: var(--mat-sys-on-surface-variant);
      }
      mat-card-content { padding: 16px; }
      .materials h3 { margin: 0 0 16px; font-weight: 500; }
      .material-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
      .material-list li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
      }
    `,
  ],
})
export class SpeakerDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SpeakerService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly loadingMats = signal(false);
  readonly speaker = signal<SpeakerResponse | null>(null);
  readonly materials = signal<PresentationMaterialResponse[]>([]);
  readonly format = formatDateTime;

  canEdit(): boolean {
    return this.auth.hasAnyRole('ORGANIZER', 'SPEAKER', 'ADMIN');
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: (s) => {
        this.speaker.set(s);
        this.loading.set(false);
        this.fetchMaterials();
      },
      error: () => this.loading.set(false),
    });
  }

  private fetchMaterials(): void {
    const s = this.speaker();
    if (!s) return;
    this.loadingMats.set(true);
    this.api.listMaterials(s.id).subscribe({
      next: (rows) => {
        this.materials.set(rows);
        this.loadingMats.set(false);
      },
      error: () => this.loadingMats.set(false),
    });
  }

  edit(): void {
    const s = this.speaker();
    if (!s) return;
    const ref = this.dialog.open(SpeakerFormDialogComponent, { data: { speaker: s } });
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.api.update(s.id, req).subscribe({
        next: (updated) => {
          this.speaker.set(updated);
          this.snack.open('Speaker updated', 'OK', { duration: 2000 });
        },
      });
    });
  }

  upload(): void {
    const s = this.speaker();
    if (!s) return;
    const ref = this.dialog.open(MaterialsUploadDialogComponent, {
      data: { speakerId: s.id },
    });
    ref.afterClosed().subscribe((m) => {
      if (m) this.fetchMaterials();
    });
  }
}
