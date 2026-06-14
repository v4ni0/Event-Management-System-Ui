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
  template: `
    <div class="header">
      <h3>Agenda</h3>
      @if (canEdit()) {
        <div class="actions">
          <button mat-stroked-button (click)="openReorder()" [disabled]="items().length < 2">
            <mat-icon>swap_vert</mat-icon> Reorder
          </button>
          <button mat-flat-button color="primary" (click)="add()">
            <mat-icon>add</mat-icon> Add item
          </button>
        </div>
      }
    </div>

    @if (loading()) {
      <div class="center-spinner"><mat-spinner diameter="32"></mat-spinner></div>
    } @else if (items().length) {
      <ol class="agenda">
        @for (it of items(); track it.id) {
          <li class="item">
            <div class="time-col">
              <div class="time">{{ time(it.startTime) }}</div>
              <div class="time-end">{{ time(it.endTime) }}</div>
            </div>
            <div class="content">
              <div class="title-row">
                <strong>{{ it.title }}</strong>
                @if (it.type) {
                  <mat-chip class="chip" disableRipple>{{ pretty(it.type) }}</mat-chip>
                }
              </div>
              @if (it.description) {
                <p class="text-muted">{{ it.description }}</p>
              }
              <div class="meta">
                @if (it.locationRoom) {
                  <span><mat-icon>place</mat-icon>{{ it.locationRoom }}</span>
                }
                @if (it.speakerId) {
                  <span><mat-icon>person</mat-icon>{{ speakerName(it.speakerId) }}</span>
                }
              </div>
            </div>
            @if (canEdit()) {
              <div class="row-actions">
                <button mat-icon-button (click)="edit(it)" aria-label="Edit"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="remove(it)" aria-label="Delete"><mat-icon>delete</mat-icon></button>
              </div>
            }
          </li>
        }
      </ol>
    } @else {
      <app-empty-state
        icon="schedule"
        title="No agenda items yet"
        message="Once the schedule is published, it will show here."
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
      .actions { display: flex; gap: 8px; }
      .agenda { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
      .item {
        display: flex;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
        align-items: flex-start;
      }
      .time-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-width: 80px;
        font-size: 0.9rem;
      }
      .time { font-weight: 600; }
      .time-end { color: var(--mat-sys-on-surface-variant); font-size: 0.85rem; }
      .content { flex: 1; }
      .title-row { display: flex; align-items: center; gap: 8px; }
      .meta {
        margin-top: 8px;
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
      }
      .meta span { display: inline-flex; align-items: center; gap: 4px; }
      .meta mat-icon { font-size: 16px; width: 16px; height: 16px; }
      .row-actions { display: flex; gap: 4px; }
      .chip { font-size: 0.7rem; min-height: 22px; }
    `,
  ],
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
