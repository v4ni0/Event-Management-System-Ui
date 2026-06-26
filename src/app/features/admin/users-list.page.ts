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
  templateUrl: './users-list.page.html',
  styleUrl: './users-list.page.css',
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
