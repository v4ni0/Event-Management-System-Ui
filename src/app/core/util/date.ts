// Backend uses LocalDateTime with no offset, e.g. "2026-06-20T18:00:00".
// Helpers to bridge that representation to JS Date.

export function toBackendDateTime(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Build a local-time string yyyy-MM-ddTHH:mm:ss without timezone.
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
}

export function fromBackendDateTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  // Backend sends "YYYY-MM-DDTHH:mm:ss" without offset. JS parses that as
  // local time per ECMAScript (different from offset-bearing ISO strings,
  // which parse as UTC). This works as long as the backend and the client
  // run in the same timezone — true here since both are dev-local. Multi-
  // timezone deployments would need the backend to emit a zoned offset.
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const date = value instanceof Date ? value : fromBackendDateTime(value as string | null);
  if (!date) return '';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = value instanceof Date ? value : fromBackendDateTime(value as string | null);
  if (!date) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export function formatTime(value: string | Date | null | undefined): string {
  const date = value instanceof Date ? value : fromBackendDateTime(value as string | null);
  if (!date) return '';
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
