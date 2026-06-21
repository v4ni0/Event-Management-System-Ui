import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EventService } from '../../core/services/event.service';
import { EventRequest, EventResponse } from '../../core/models/event';
import {
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  EventCategory,
  EventStatus,
  prettyEnum,
} from '../../core/models/enums';
import { toBackendDateTime } from '../../core/util/date';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { ImageUploadComponent } from '../../shared/image-upload.component';

@Component({
  selector: 'app-event-form-page',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    ImageUploadComponent
  ],
  template: `
    <div class="page-container">
      <app-page-header [title]="isEdit() ? 'Edit event' : 'Create event'"></app-page-header>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <mat-card>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput rows="4" formControlName="description"></textarea>
            </mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>City</mat-label>
                <input matInput formControlName="city" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Venue</mat-label>
                <input matInput formControlName="venue" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Venue address</mat-label>
              <input matInput formControlName="venueAddress" />
            </mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Start date</mat-label>
                <input
                  matInput
                  [matDatepicker]="startPicker"
                  formControlName="startDate"
                />
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Start time</mat-label>
                <input matInput type="time" formControlName="startTime" />
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>End date</mat-label>
                <input
                  matInput
                  [matDatepicker]="endPicker"
                  formControlName="endDate"
                />
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>End time</mat-label>
                <input matInput type="time" formControlName="endTime" />
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Capacity</mat-label>
                <input matInput type="number" min="1" formControlName="capacity" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  @for (s of statuses; track s) {
                    <mat-option [value]="s">{{ pretty(s) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option [value]="null">None</mat-option>
                @for (c of categories; track c) {
                  <mat-option [value]="c">{{ pretty(c) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <label class="field-label">Cover image</label>
            <app-image-upload formControlName="imageUrl" label="No cover image yet"></app-image-upload>
           

            <div class="actions">
              <button mat-button type="button" routerLink="/events">Cancel</button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || saving()"
              >
                @if (saving()) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  {{ isEdit() ? 'Save changes' : 'Create event' }}
                }
              </button>
            </div>
          </form>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      mat-card { padding: 24px; }
      form { display: flex; flex-direction: column; gap: 4px; }
      .row { display: flex; gap: 12px; }
      .row > * { flex: 1; }
      .full-width { width: 100%; }
      .field-label {
        display: block;
        font-size: 0.85rem;
        color: var(--mat-sys-on-surface-variant);
        margin: 8px 0 6px;
       }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
      mat-spinner { margin: 0 8px; }
      @media (max-width: 600px) {
        .row { flex-direction: column; gap: 0; }
      }
    `,
  ],
})
export class EventFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly events = inject(EventService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly statuses = EVENT_STATUSES;
  readonly categories = EVENT_CATEGORIES;
  readonly pretty = prettyEnum;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isEdit = signal(false);
  private editingId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    city: [''],
    venue: [''],
    venueAddress: [''],
    startDate: [null as Date | null, [Validators.required]],
    startTime: ['09:00', [Validators.required]],
    endDate: [null as Date | null, [Validators.required]],
    endTime: ['17:00', [Validators.required]],
    capacity: [100, [Validators.required, Validators.min(1)]],
    status: ['DRAFT' as EventStatus, [Validators.required]],
    category: [null as EventCategory | null],
    imageUrl: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editingId = Number(id);
      this.loading.set(true);
      this.events.getById(this.editingId).subscribe({
        next: (e) => {
          this.populate(e);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  private populate(e: EventResponse): void {
    const start = e.startDate ? new Date(e.startDate) : null;
    const end = e.endDate ? new Date(e.endDate) : null;
    this.form.patchValue({
      title: e.title,
      description: e.description ?? '',
      city: e.city ?? '',
      venue: e.venue ?? '',
      venueAddress: e.venueAddress ?? '',
      startDate: start,
      startTime: start ? toHHMM(start) : '09:00',
      endDate: end,
      endTime: end ? toHHMM(end) : '17:00',
      capacity: e.capacity,
      status: e.status,
      category: e.category,
      imageUrl: e.imageUrl ?? '',
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const startISO = combine(v.startDate!, v.startTime);
    const endISO = combine(v.endDate!, v.endTime);
    if (!startISO || !endISO) {
      this.snack.open('Pick valid start and end dates.', 'Dismiss', { duration: 3000 });
      return;
    }
    const req: EventRequest = {
      title: v.title.trim(),
      description: v.description?.trim() || null,
      city: v.city?.trim() || null,
      venue: v.venue?.trim() || null,
      venueAddress: v.venueAddress?.trim() || null,
      startDate: startISO,
      endDate: endISO,
      capacity: Number(v.capacity),
      status: v.status,
      category: v.category,
      imageUrl: v.imageUrl?.trim() || null,
    };
    this.saving.set(true);
    const obs = this.isEdit() && this.editingId
      ? this.events.update(this.editingId, req)
      : this.events.create(req);
    obs.subscribe({
      next: (e) => {
        this.saving.set(false);
        this.snack.open(this.isEdit() ? 'Event updated' : 'Event created', 'OK', { duration: 2500 });
        this.router.navigate(['/events', e.id]);
      },
      error: () => this.saving.set(false),
    });
  }
}

function toHHMM(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combine(date: Date, time: string): string | null {
  if (!date || !time) return null;
  const [h, m] = time.split(':').map((n) => Number(n));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const merged = new Date(date);
  merged.setHours(h, m, 0, 0);
  return toBackendDateTime(merged);
}
