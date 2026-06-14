import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { Page } from '../../core/models/page';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { RoleChipComponent } from '../../shared/role-chip.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { formatDateTime } from '../../core/util/date';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    PageHeaderComponent,
    RoleChipComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container wide">
      <app-page-header title="Users" subtitle="All registered accounts."></app-page-header>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (page()?.content?.length) {
        <mat-card>
          <table mat-table [dataSource]="page()!.content" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let u">{{ u.id }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let u">{{ u.firstName }} {{ u.lastName }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u"><app-role-chip [role]="u.role"></app-role-chip></td>
            </ng-container>
            <ng-container matColumnDef="created">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let u">{{ format(u.createdAt) }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>
          </table>
        </mat-card>
        <mat-paginator
          [length]="page()!.totalElements"
          [pageSize]="page()!.size"
          [pageIndex]="page()!.number"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons
        ></mat-paginator>
      } @else {
        <app-empty-state icon="people" title="No users found"></app-empty-state>
      }
    </div>
  `,
  styles: [
    `
      mat-card { padding: 0; overflow: hidden; }
      table { width: 100%; }
      mat-paginator { background: transparent; margin-top: 8px; }
    `,
  ],
})
export class AdminUsersPage implements OnInit {
  private readonly api = inject(UserService);
  readonly loading = signal(false);
  readonly page = signal<Page<User> | null>(null);
  readonly cols = ['id', 'name', 'email', 'role', 'created'];
  readonly format = formatDateTime;

  private currentPage = 0;
  private pageSize = 20;

  ngOnInit(): void {
    this.fetch();
  }

  onPage(ev: PageEvent): void {
    this.currentPage = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.api.list(this.currentPage, this.pageSize).subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
