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
  template: `
    <div class="page-container wide">
      <app-page-header title="Events" subtitle="Find your next experience.">
        <ng-container actions></ng-container>
      </app-page-header>

      <mat-card class="filters">
        <form [formGroup]="filterForm" (ngSubmit)="apply()">
          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <input matInput formControlName="city" placeholder="e.g. Sofia" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option [value]="null">Any</mat-option>
              @for (c of categories; track c) {
                <mat-option [value]="c">{{ pretty(c) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option [value]="null">Any</mat-option>
              @for (s of statuses; track s) {
                <mat-option [value]="s">{{ pretty(s) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit">
            <mat-icon>search</mat-icon>
            Search
          </button>
          <button mat-button type="button" (click)="reset()">Reset</button>
        </form>
      </mat-card>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (page()?.content?.length) {
        <div class="grid">
          @for (event of page()!.content; track event.id) {
            <mat-card class="event-card" [routerLink]="['/events', event.id]">
              @if (event.imageUrl) {
                <img mat-card-image [src]="event.imageUrl" [alt]="event.title" />
              } @else {
                <div class="image-placeholder">
                  <mat-icon>event</mat-icon>
                </div>
              }
              <mat-card-content>
                <div class="card-meta">
                  <app-status-chip [status]="event.status"></app-status-chip>
                  @if (event.category) {
                    <span class="category">{{ pretty(event.category) }}</span>
                  }
                </div>
                <h3>{{ event.title }}</h3>
                <p class="when">{{ formatDate(event.startDate) }}</p>
                @if (event.city || event.venue) {
                  <p class="where">
                    <mat-icon>place</mat-icon>
                    {{ event.venue || event.city }}{{ event.venue && event.city ? ', ' + event.city : '' }}
                  </p>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
        <mat-paginator
          [length]="page()!.totalElements"
          [pageSize]="page()!.size"
          [pageIndex]="page()!.number"
          [pageSizeOptions]="[6, 12, 24]"
          (page)="onPage($event)"
          showFirstLastButtons
        ></mat-paginator>
      } @else {
        <app-empty-state
          icon="event_busy"
          title="No events found"
          message="Try clearing the filters above."
        ></app-empty-state>
      }
    </div>
  `,
  styles: [
    `
      .filters { padding: 16px; margin-bottom: 24px; }
      .filters form {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      .filters mat-form-field { min-width: 160px; flex: 1 1 180px; }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      .event-card {
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
        overflow: hidden;
      }
      .event-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
      }
      .event-card img {
        width: 100%;
        height: 160px;
        object-fit: cover;
      }
      .image-placeholder {
        width: 100%;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mat-sys-surface-variant);
      }
      .image-placeholder mat-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        color: var(--mat-sys-on-surface-variant);
      }
      .card-meta {
        display: flex;
        gap: 8px;
        align-items: center;
        margin: 4px 0 8px;
      }
      .category { font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); }
      h3 { margin: 4px 0; font-size: 1.05rem; font-weight: 500; }
      .when { margin: 0 0 4px; color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
      .where {
        margin: 0;
        display: flex;
        gap: 4px;
        align-items: center;
        font-size: 0.85rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .where mat-icon { font-size: 16px; width: 16px; height: 16px; }
      mat-paginator { margin-top: 24px; background: transparent; }
    `,
  ],
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
