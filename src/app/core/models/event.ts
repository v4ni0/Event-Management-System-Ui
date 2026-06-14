import { EventCategory, EventStatus } from './enums';

export interface EventRequest {
  title: string;
  description?: string | null;
  city?: string | null;
  venue?: string | null;
  venueAddress?: string | null;
  startDate: string; // ISO LocalDateTime, no offset, e.g. 2026-06-20T18:00:00
  endDate: string;
  capacity: number;
  status: EventStatus;
  category?: EventCategory | null;
  imageUrl?: string | null;
}

export interface EventResponse {
  id: number;
  title: string;
  description: string | null;
  city: string | null;
  venue: string | null;
  venueAddress: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  status: EventStatus;
  category: EventCategory | null;
  imageUrl: string | null;
  organizerId: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface EventSummaryResponse {
  id: number;
  title: string;
  city: string | null;
  venue: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  status: EventStatus;
  category: EventCategory | null;
  totalRegistrations: number;
  totalCheckIns: number;
  availableCapacity: number;
  ticketTypesCount: number;
  averageRating: number | null;
  revenue: number | null;
}

export interface EventListFilters {
  status?: EventStatus | null;
  category?: EventCategory | null;
  city?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  page?: number;
  size?: number;
  sort?: string;
}
