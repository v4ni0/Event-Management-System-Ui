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
  templateUrl: './agenda-reorder.dialog.html',
  styleUrl: './agenda-reorder.dialog.css',
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
