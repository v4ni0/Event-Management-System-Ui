import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EventService } from '../../core/services/event.service';
import { TicketService } from '../../core/services/ticket.service';
import { RegistrationService } from '../../core/services/registration.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { AuthService } from '../../core/services/auth.service';
import { EventResponse } from '../../core/models/event';
import { TicketResponse } from '../../core/models/ticket';
import { RegistrationResponse } from '../../core/models/registration';
import { EVENT_STATUSES, EventStatus, prettyEnum } from '../../core/models/enums';
import { formatDateTime } from '../../core/util/date';

import { StatusChipComponent } from '../../shared/status-chip.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

import { TicketAdminListComponent } from '../tickets/ticket-admin-list.component';
import { TicketPurchaseDialogComponent } from '../tickets/ticket-purchase.dialog';
import { AgendaListComponent } from '../agenda/agenda-list.component';
import { FeedbackSummaryComponent } from '../feedback/feedback-summary.component';
import { FeedbackListComponent } from '../feedback/feedback-list.component';
import { FeedbackFormDialogComponent } from '../feedback/feedback-form.dialog';
import { EventSummaryComponent } from './event-summary.component';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    StatusChipComponent,
    TicketAdminListComponent,
    AgendaListComponent,
    FeedbackSummaryComponent,
    FeedbackListComponent,
    EventSummaryComponent,
  ],
  template: `
    @if (loading()) {
      <div class="page-container"><div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div></div>
    } @else if (event(); as e) {
      <div class="hero">
        @if (e.imageUrl) {
          <img [src]="e.imageUrl" [alt]="e.title" />
        } @else {
          <div class="placeholder"><mat-icon>event</mat-icon></div>
        }
      </div>

      <div class="page-container">
        <div class="title-row">
          <div>
            <div class="meta-row">
              <app-status-chip [status]="e.status"></app-status-chip>
              @if (e.category) {
                <mat-chip disableRipple class="cat-chip">{{ pretty(e.category) }}</mat-chip>
              }
            </div>
            <h1>{{ e.title }}</h1>
            <div class="info-row">
              <span><mat-icon>schedule</mat-icon>{{ format(e.startDate) }} → {{ format(e.endDate) }}</span>
              @if (e.venue || e.city) {
                <span><mat-icon>place</mat-icon>{{ e.venue || '' }}{{ e.venue && e.city ? ', ' : '' }}{{ e.city || '' }}</span>
              }
              <span><mat-icon>group</mat-icon>{{ e.capacity }} capacity</span>
            </div>
          </div>
          <div class="actions">
            @if (canBuy()) {
              <button mat-flat-button color="primary" (click)="openPurchase()">
                <mat-icon>local_activity</mat-icon> Get tickets
              </button>
            }
            <button
              mat-stroked-button
              (click)="openFeedback()"
              [disabled]="!canSubmitFeedback()"
              [matTooltip]="feedbackTooltip()"
            >
              <mat-icon>rate_review</mat-icon> Leave feedback
            </button>
            @if (canManage()) {
              <a mat-stroked-button [routerLink]="['/events', e.id, 'registrations']">
                <mat-icon>how_to_reg</mat-icon> Registrations
              </a>
              <a mat-stroked-button [routerLink]="['/events', e.id, 'analytics']">
                <mat-icon>insights</mat-icon> Analytics
              </a>
              <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="More">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <a mat-menu-item [routerLink]="['/events', e.id, 'edit']">
                  <mat-icon>edit</mat-icon><span>Edit event</span>
                </a>
                @for (s of statuses; track s) {
                  @if (s !== e.status) {
                    <button mat-menu-item (click)="changeStatus(s)">
                      <mat-icon>flag</mat-icon><span>Mark {{ pretty(s) }}</span>
                    </button>
                  }
                }
                <button mat-menu-item (click)="remove()" class="warn">
                  <mat-icon>delete</mat-icon><span>Delete event</span>
                </button>
              </mat-menu>
            }
          </div>
        </div>

        @if (e.description) {
          <p class="description">{{ e.description }}</p>
        }

        <mat-tab-group dynamicHeight class="tabs">
          <mat-tab label="Overview">
            <div class="tab-body">
              <h3>Stats</h3>
              <app-event-summary [eventId]="e.id"></app-event-summary>

              <h3 class="mt-24">Feedback</h3>
              <app-feedback-summary [eventId]="e.id"></app-feedback-summary>

              @if (e.venueAddress) {
                <h3 class="mt-24">Venue address</h3>
                <p>{{ e.venueAddress }}</p>
              }
            </div>
          </mat-tab>

          <mat-tab label="Tickets">
            <div class="tab-body">
              @if (canManage()) {
                <app-ticket-admin-list [eventId]="e.id"></app-ticket-admin-list>
              } @else {
                @if (tickets().length) {
                  <ul class="public-tickets">
                    @for (t of tickets(); track t.id) {
                      <li>
                        <div>
                          <strong>{{ t.name }}</strong>
                          @if (t.description) {
                            <div class="text-muted text-small">{{ t.description }}</div>
                          }
                          <div class="text-small text-muted">
                            {{ t.quantityAvailable - t.quantitySold }} of {{ t.quantityAvailable }} left
                          </div>
                        </div>
                        <div class="price-col">
                          <div class="price">{{ t.price | number: '1.2-2' }}</div>
                          <app-status-chip [status]="t.status"></app-status-chip>
                        </div>
                      </li>
                    }
                  </ul>
                  @if (canBuy()) {
                    <button mat-flat-button color="primary" (click)="openPurchase()" class="mt-16">
                      <mat-icon>shopping_cart</mat-icon> Get a ticket
                    </button>
                  }
                } @else {
                  <p class="text-muted">No tickets yet.</p>
                }
              }
            </div>
          </mat-tab>

          <mat-tab label="Agenda">
            <div class="tab-body">
              <app-agenda-list [eventId]="e.id" [canEdit]="canManage()"></app-agenda-list>
            </div>
          </mat-tab>

          <mat-tab label="Feedback">
            <div class="tab-body">
              <app-feedback-summary [eventId]="e.id"></app-feedback-summary>
              @if (canManage()) {
                <h3 class="mt-24">All reviews</h3>
                <app-feedback-list [eventId]="e.id"></app-feedback-list>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    }
  `,
  styles: [
    `
      .hero { width: 100%; height: 320px; overflow: hidden; }
      .hero img {
        width: 100%; height: 100%; object-fit: cover;
      }
      .hero .placeholder {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mat-sys-surface-variant);
      }
      .hero .placeholder mat-icon {
        font-size: 96px; width: 96px; height: 96px; color: var(--mat-sys-on-surface-variant);
      }
      .title-row {
        display: flex;
        align-items: flex-start;
        gap: 24px;
        margin-top: 16px;
      }
      .title-row h1 { margin: 8px 0; font-weight: 500; font-size: 2rem; }
      .meta-row { display: flex; gap: 8px; align-items: center; }
      .info-row {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.95rem;
      }
      .info-row span { display: inline-flex; align-items: center; gap: 6px; }
      .info-row mat-icon { font-size: 18px; width: 18px; height: 18px; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      .description {
        margin: 24px 0 16px;
        white-space: pre-wrap;
        line-height: 1.55;
      }
      .tabs { margin-top: 16px; }
      .tab-body { padding: 24px 0; }
      .tab-body h3 { font-weight: 500; margin: 0 0 16px; }
      .cat-chip { font-size: 0.72rem; min-height: 22px; }

      .public-tickets {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .public-tickets li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
      }
      .price-col { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
      .price { font-weight: 600; font-size: 1.1rem; }
      .warn { color: #b71c1c; }

      @media (max-width: 720px) {
        .title-row { flex-direction: column; }
      }
    `,
  ],
})
export class EventDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly events = inject(EventService);
  private readonly ticketsApi = inject(TicketService);
  private readonly registrationsApi = inject(RegistrationService);
  private readonly feedbackApi = inject(FeedbackService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly event = signal<EventResponse | null>(null);
  readonly tickets = signal<TicketResponse[]>([]);
  readonly myRegs = signal<RegistrationResponse[]>([]);
  readonly format = formatDateTime;
  readonly pretty = prettyEnum;
  readonly statuses = EVENT_STATUSES;

  readonly canManage = computed(() => {
    const u = this.auth.currentUserSignal();
    const e = this.event();
    if (!u || !e) return false;
    if (u.role === 'ADMIN') return true;
    return u.role === 'ORGANIZER' && u.id === e.organizerId;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const id = Number(pm.get('id'));
      if (!id) return;
      this.fetch(id);
    });
  }

  private fetch(id: number): void {
    this.loading.set(true);
    this.events.getById(id).subscribe({
      next: (e) => {
        this.event.set(e);
        this.loading.set(false);
        this.ticketsApi.list(id).subscribe((rows) => this.tickets.set(rows));
        if (this.auth.currentUser) {
          this.registrationsApi.listMine(0, 100).subscribe((p) => {
            this.myRegs.set(p.content.filter((r) => r.eventId === id));
          });
        }
      },
      error: () => this.loading.set(false),
    });
  }

  canBuy(): boolean {
    const e = this.event();
    if (!e || e.status !== 'PUBLISHED') return false;
    if (!this.auth.currentUser) return false;
    return this.tickets().some((t) => t.status === 'AVAILABLE');
  }

  canSubmitFeedback(): boolean {
    if (!this.auth.currentUser) return false;
    return this.myRegs().some((r) => r.status === 'CHECKED_IN');
  }

  feedbackTooltip(): string {
    if (!this.auth.currentUser) return 'Sign in to leave feedback';
    if (!this.canSubmitFeedback()) {
      return 'You can leave feedback once an organizer checks you in.';
    }
    return '';
  }

  openPurchase(): void {
    const e = this.event();
    if (!e) return;
    if (!this.auth.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    const ref = this.dialog.open(TicketPurchaseDialogComponent, {
      data: { event: e, tickets: this.tickets() },
    });
    ref.afterClosed().subscribe((ticketId: number | undefined) => {
      if (!ticketId) return;
      this.registrationsApi.register(e.id, { ticketId }).subscribe({
        next: () => {
          this.snack.open('Registered. See it in My tickets.', 'OK', { duration: 3000 });
          this.fetch(e.id);
        },
      });
    });
  }

  openFeedback(): void {
    const e = this.event();
    if (!e || !this.canSubmitFeedback()) return;
    const ref = this.dialog.open(FeedbackFormDialogComponent, {
      data: { eventTitle: e.title },
    });
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.feedbackApi.submit(e.id, req).subscribe({
        next: () => this.snack.open('Thanks for your feedback!', 'OK', { duration: 2500 }),
      });
    });
  }

  changeStatus(status: EventStatus): void {
    const e = this.event();
    if (!e) return;
    this.events.changeStatus(e.id, status).subscribe({
      next: (updated) => {
        this.event.set(updated);
        this.snack.open(`Status changed to ${this.pretty(status)}`, 'OK', { duration: 2000 });
      },
    });
  }

  remove(): void {
    const e = this.event();
    if (!e) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete event?',
        message: `This will remove "${e.title}" permanently.`,
        destructive: true,
        confirmText: 'Delete event',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.events.delete(e.id).subscribe({
        next: () => {
          this.snack.open('Event deleted', 'OK', { duration: 2000 });
          this.router.navigate(['/events']);
        },
      });
    });
  }
}
