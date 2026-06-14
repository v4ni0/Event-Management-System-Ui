import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div class="title-row">
        <h1>{{ title() }}</h1>
        <div class="actions"><ng-content select="[actions]"></ng-content></div>
      </div>
      @if (subtitle()) {
        <p class="subtitle">{{ subtitle() }}</p>
      }
    </header>
  `,
  styles: [
    `
      :host { display: block; margin-bottom: 24px; }
      .title-row { display: flex; align-items: center; gap: 16px; }
      h1 { margin: 0; font-size: 1.75rem; font-weight: 500; flex: 1; }
      .subtitle { margin: 8px 0 0; color: var(--mat-sys-on-surface-variant); }
      .actions { display: flex; gap: 8px; align-items: center; }
    `,
  ],
})
export class PageHeaderComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string | null>(null);
}
