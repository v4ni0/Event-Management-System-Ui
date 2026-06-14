import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { AgendaItemResponse } from '../../core/models/agenda-item';
import { formatTime } from '../../core/util/date';

export interface AgendaReorderDialogData {
  items: AgendaItemResponse[];
}

@Component({
  selector: 'app-agenda-reorder-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CdkDropList,
    CdkDrag,
  ],
  template: `
    <h2 mat-dialog-title>Reorder agenda</h2>
    <mat-dialog-content>
      <p class="muted">Drag items to reorder.</p>
      <ul cdkDropList class="reorder-list" (cdkDropListDropped)="drop($event)">
        @for (item of items; track item.id) {
          <li cdkDrag class="reorder-item">
            <mat-icon class="grip">drag_indicator</mat-icon>
            <div class="text">
              <strong>{{ item.title }}</strong>
              <span class="muted small">{{ time(item.startTime) }} – {{ time(item.endTime) }}</span>
            </div>
          </li>
        }
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Save order</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content { min-width: 360px; }
      .reorder-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .reorder-item {
        background: var(--mat-sys-surface-variant);
        padding: 8px 12px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: move;
      }
      .text { display: flex; flex-direction: column; }
      .grip { color: var(--mat-sys-on-surface-variant); }
      .muted { color: var(--mat-sys-on-surface-variant); }
      .small { font-size: 0.85rem; }
      .cdk-drag-preview {
        background: var(--mat-sys-surface);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        padding: 8px 12px;
      }
      .cdk-drag-placeholder {
        opacity: 0.3;
      }
    `,
  ],
})
export class AgendaReorderDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AgendaReorderDialogComponent>);
  private readonly data = inject<AgendaReorderDialogData>(MAT_DIALOG_DATA);

  readonly items: AgendaItemResponse[] = [...this.data.items];
  readonly time = formatTime;

  drop(ev: CdkDragDrop<AgendaItemResponse[]>): void {
    moveItemInArray(this.items, ev.previousIndex, ev.currentIndex);
  }

  save(): void {
    this.dialogRef.close(this.items.map((i) => i.id));
  }
}
