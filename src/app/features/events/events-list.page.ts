import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { EventService } from '../../core/services/event.service';
import { EventResponse } from '../../core/models/event';
import {
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  EventCategory,
  EventStatus,
  prettyEnum,
} from '../../core/models/enums';
import { Page } from '../../core/models/page';
import { formatDateTime } from '../../core/util/date';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { StatusChipComponent } from '../../shared/status-chip.component';

@Component({
  selector: 'app-events-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusChipComponent,
  ],
  templateUrl: './events-list.page.html',
  styleUrl: './events-list.page.css',
})
export class EventsListPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly events = inject(EventService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly statuses = EVENT_STATUSES;
  readonly categories = EVENT_CATEGORIES;
  readonly pretty = prettyEnum;
  readonly formatDate = formatDateTime;

  readonly loading = signal(false);
  readonly page = signal<Page<EventResponse> | null>(null);

  readonly filterForm = this.fb.group({
    city: [null as string | null],
    category: [null as EventCategory | null],
    status: [null as EventStatus | null],
  });

  private currentPage = 0;
  private pageSize = 12;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((qm) => {
      this.filterForm.patchValue(
        {
          city: qm.get('city'),
          category: (qm.get('category') as EventCategory) || null,
          status: (qm.get('status') as EventStatus) || null,
        },
        { emitEvent: false },
      );
      this.currentPage = Number(qm.get('page') ?? 0) || 0;
      this.pageSize = Number(qm.get('size') ?? 12) || 12;
      this.fetch();
    });
  }

  apply(): void {
    this.currentPage = 0;
    this.syncQuery();
  }

  reset(): void {
    this.filterForm.reset({ city: null, category: null, status: null });
    this.currentPage = 0;
    this.syncQuery();
  }

  onPage(ev: PageEvent): void {
    this.currentPage = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.syncQuery();
  }

  private syncQuery(): void {
    const v = this.filterForm.value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        city: v.city || null,
        category: v.category || null,
        status: v.status || null,
        page: this.currentPage || null,
        size: this.pageSize !== 12 ? this.pageSize : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private fetch(): void {
    this.loading.set(true);
    const v = this.filterForm.value;
    this.events
      .list({
        city: v.city || null,
        category: v.category || null,
        status: v.status || null,
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (p) => {
          this.page.set(p);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
