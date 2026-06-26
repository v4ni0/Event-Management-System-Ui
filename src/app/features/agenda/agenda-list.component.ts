import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { AgendaService } from '../../core/services/agenda.service';
import { SpeakerService } from '../../core/services/speaker.service';
import { AgendaItemResponse } from '../../core/models/agenda-item';
import { SpeakerResponse } from '../../core/models/speaker';
import { prettyEnum } from '../../core/models/enums';
import { formatDateTime, formatTime } from '../../core/util/date';
import { AgendaFormDialogComponent } from './agenda-form.dialog';
import { AgendaReorderDialogComponent } from './agenda-reorder.dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-agenda-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    EmptyStateComponent,
  ],
  templateUrl: './agenda-list.component.html',
  styleUrl: './agenda-list.component.css',
})
export class AgendaListComponent implements OnInit {
  readonly eventId = input.required<number>();
  readonly canEdit = input<boolean>(false);

  private readonly agendaApi = inject(AgendaService);
  private readonly speakerApi = inject(SpeakerService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly items = signal<AgendaItemResponse[]>([]);
  readonly speakers = signal<SpeakerResponse[]>([]);
  readonly loading = signal(false);
  readonly time = formatTime;
  readonly format = formatDateTime;
  readonly pretty = prettyEnum;

  ngOnInit(): void {
    this.refresh();
    this.speakerApi.list().subscribe((s) => this.speakers.set(s));
  }

  speakerName(id: number): string {
    return this.speakers().find((s) => s.id === id)?.name ?? `Speaker #${id}`;
  }

  refresh(): void {
    this.loading.set(true);
    this.agendaApi.list(this.eventId()).subscribe({
      next: (rows) => {
        this.items.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  add(): void {
    const ref = this.dialog.open(AgendaFormDialogComponent, { data: { speakers: this.speakers() } });
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.agendaApi.create(this.eventId(), req).subscribe({
        next: () => {
          this.snack.open('Agenda item added', 'OK', { duration: 2000 });
          this.refresh();
        },
      });
    });
  }

  edit(item: AgendaItemResponse): void {
    const ref = this.dialog.open(AgendaFormDialogComponent, {
      data: { item, speakers: this.speakers() },
    });
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.agendaApi.update(this.eventId(), item.id, req).subscribe({
        next: () => {
          this.snack.open('Agenda item updated', 'OK', { duration: 2000 });
          this.refresh();
        },
      });
    });
  }

  remove(item: AgendaItemResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete agenda item?',
        message: `Remove "${item.title}"?`,
        destructive: true,
        confirmText: 'Delete',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.agendaApi.delete(this.eventId(), item.id).subscribe({
        next: () => {
          this.snack.open('Agenda item deleted', 'OK', { duration: 2000 });
          this.refresh();
        },
      });
    });
  }

  openReorder(): void {
    const ref = this.dialog.open(AgendaReorderDialogComponent, {
      data: { items: this.items() },
    });
    ref.afterClosed().subscribe((order: number[] | undefined) => {
      if (!order) return;
      this.agendaApi.reorder(this.eventId(), order).subscribe({
        next: (rows) => {
          this.items.set(rows);
          this.snack.open('Agenda reordered', 'OK', { duration: 2000 });
        },
      });
    });
  }
}
