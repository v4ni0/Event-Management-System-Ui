import { AgendaItemType } from './enums';

export interface AgendaItemRequest {
  title: string;
  description?: string | null;
  speakerId?: number | null;
  startTime: string;
  endTime: string;
  locationRoom?: string | null;
  orderIndex?: number | null;
  type?: AgendaItemType | null;
}

export interface AgendaItemResponse {
  id: number;
  eventId: number;
  speakerId: number | null;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  locationRoom: string | null;
  orderIndex: number | null;
  type: AgendaItemType | null;
}
