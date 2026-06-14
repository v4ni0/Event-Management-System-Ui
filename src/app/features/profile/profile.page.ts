import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { RoleChipComponent } from '../../shared/role-chip.component';
import { formatDateTime } from '../../core/util/date';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    RoleChipComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Your profile"></app-page-header>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <mat-card>
          <div class="header">
            <div>
              <div class="muted">Account</div>
              <h2>{{ form.controls.firstName.value }} {{ form.controls.lastName.value }}</h2>
              @if (auth.currentUser; as u) {
                <div class="meta">
                  <app-role-chip [role]="u.role"></app-role-chip>
                  <span class="text-muted text-small">Member since {{ format(u.createdAt) }}</span>
                </div>
              }
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>First name</mat-label>
                <input matInput formControlName="firstName" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Last name</mat-label>
                <input matInput formControlName="lastName" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <div class="actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                @if (saving()) { <mat-spinner diameter="18"></mat-spinner> } @else { Save changes }
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
      .header { margin-bottom: 24px; }
      .header h2 { margin: 4px 0 8px; font-weight: 500; }
      .meta { display: flex; align-items: center; gap: 12px; }
      .muted { color: var(--mat-sys-on-surface-variant); font-size: 0.85rem; }
      form { display: flex; flex-direction: column; gap: 4px; }
      .row { display: flex; gap: 12px; }
      .row > * { flex: 1; }
      .full-width { width: 100%; }
      .actions { display: flex; justify-content: flex-end; margin-top: 8px; }
    `,
  ],
})
export class ProfilePage implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly format = formatDateTime;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getMe().subscribe({
      next: (u) => {
        this.form.patchValue({ email: u.email, firstName: u.firstName, lastName: u.lastName });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.api.updateMe(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open('Profile saved', 'OK', { duration: 2000 });
      },
      error: () => this.saving.set(false),
    });
  }
}
