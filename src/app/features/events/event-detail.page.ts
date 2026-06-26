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
  templateUrl: './event-detail.page.html',
  styleUrl: './event-detail.page.css',
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
