// Mirrors backend bg.fmi.eventplatform.vo enums (string values match exactly).

export type UserRole = 'ATTENDEE' | 'ORGANIZER' | 'SPEAKER' | 'ADMIN';
export const USER_ROLES: UserRole[] = ['ATTENDEE', 'ORGANIZER', 'SPEAKER', 'ADMIN'];

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export const EVENT_STATUSES: EventStatus[] = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];

export type EventCategory =
  | 'MUSIC'
  | 'PERFORMING_AND_VISUAL_ARTS'
  | 'NIGHTLIFE'
  | 'HOLIDAYS'
  | 'HOBBIES'
  | 'BUSINESS'
  | 'FOOD_AND_DRINK'
  | 'SCIENCE_AND_TECHNOLOGY';
export const EVENT_CATEGORIES: EventCategory[] = [
  'MUSIC',
  'PERFORMING_AND_VISUAL_ARTS',
  'NIGHTLIFE',
  'HOLIDAYS',
  'HOBBIES',
  'BUSINESS',
  'FOOD_AND_DRINK',
  'SCIENCE_AND_TECHNOLOGY',
];

export type RegistrationStatus = 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN';

export type TicketStatus = 'AVAILABLE' | 'SOLD_OUT' | 'SALE_ENDED';

export type AgendaItemType =
  | 'OPENING_SPEECH'
  | 'GROUP_DISCUSSION'
  | 'WORKSHOP'
  | 'PRESENTATION'
  | 'NETWORKING'
  | 'BREAK'
  | 'CHECK_IN'
  | 'PERFORMANCE'
  | 'CEREMONY'
  | 'QA'
  | 'OTHER';
export const AGENDA_ITEM_TYPES: AgendaItemType[] = [
  'OPENING_SPEECH',
  'GROUP_DISCUSSION',
  'WORKSHOP',
  'PRESENTATION',
  'NETWORKING',
  'BREAK',
  'CHECK_IN',
  'PERFORMANCE',
  'CEREMONY',
  'QA',
  'OTHER',
];

export function prettyEnum(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
