import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty">
      <mat-icon>{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      @if (message()) {
        <p>{{ message() }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .empty {
        text-align: center;
        padding: 48px 16px;
        color: var(--mat-sys-on-surface-variant);
      }
      mat-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        margin-bottom: 12px;
        opacity: 0.6;
      }
      h3 { margin: 0 0 4px; font-size: 1.1rem; font-weight: 500; }
      p { margin: 0 0 12px; }
    `,
  ],
})
export class EmptyStateComponent {
  readonly title = input<string>('Nothing here yet');
  readonly message = input<string | null>(null);
  readonly icon = input<string>('inbox');
}
