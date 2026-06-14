import { TicketStatus } from './enums';

export interface TicketRequest {
  name: string;
  description?: string | null;
  price: number;
  quantityAvailable: number;
  saleStart?: string | null;
  saleEnd?: string | null;
}

export interface TicketResponse {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  saleStart: string | null;
  saleEnd: string | null;
  status: TicketStatus;
}
