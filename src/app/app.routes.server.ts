import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Parameterized routes need a getPrerenderParams to be prerendered. We don't
  // know event/speaker ids at build time, so render them on each request.
  { path: 'events/:id', renderMode: RenderMode.Server },
  { path: 'events/:id/edit', renderMode: RenderMode.Server },
  { path: 'events/:id/analytics', renderMode: RenderMode.Server },
  { path: 'events/:id/registrations', renderMode: RenderMode.Server },
  { path: 'speakers/:id', renderMode: RenderMode.Server },
  // Everything else can be prerendered.
  { path: '**', renderMode: RenderMode.Prerender },
];
