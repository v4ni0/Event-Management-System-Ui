import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password.page').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password.page').then((m) => m.ResetPasswordPage),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./features/events/events-list.page').then((m) => m.EventsListPage),
  },
  {
    path: 'events/new',
    canActivate: [authGuard, roleGuard('ORGANIZER', 'ADMIN')],
    loadComponent: () =>
      import('./features/events/event-form.page').then((m) => m.EventFormPage),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./features/events/event-detail.page').then((m) => m.EventDetailPage),
  },
  {
    path: 'events/:id/edit',
    canActivate: [authGuard, roleGuard('ORGANIZER', 'ADMIN')],
    loadComponent: () =>
      import('./features/events/event-form.page').then((m) => m.EventFormPage),
  },
  {
    path: 'events/:id/analytics',
    canActivate: [authGuard, roleGuard('ORGANIZER', 'ADMIN')],
    loadComponent: () =>
      import('./features/analytics/analytics-dashboard.page').then(
        (m) => m.AnalyticsDashboardPage,
      ),
  },
  {
    path: 'events/:id/registrations',
    canActivate: [authGuard, roleGuard('ORGANIZER', 'ADMIN')],
    loadComponent: () =>
      import('./features/registrations/event-registrations.page').then(
        (m) => m.EventRegistrationsPage,
      ),
  },
  {
    path: 'speakers',
    loadComponent: () =>
      import('./features/speakers/speakers-list.page').then((m) => m.SpeakersListPage),
  },
  {
    path: 'speakers/:id',
    loadComponent: () =>
      import('./features/speakers/speaker-detail.page').then((m) => m.SpeakerDetailPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'my-tickets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/registrations/my-registrations.page').then(
        (m) => m.MyRegistrationsPage,
      ),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadComponent: () =>
      import('./features/admin/users-list.page').then((m) => m.AdminUsersPage),
  },
  { path: '**', redirectTo: '' },
];
