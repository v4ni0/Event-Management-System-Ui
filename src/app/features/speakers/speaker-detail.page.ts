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
  templateUrl: './speaker-detail.page.html',
  styleUrl: './speaker-detail.page.css',
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
