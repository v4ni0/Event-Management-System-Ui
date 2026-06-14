import { RegistrationStatus } from './enums';

export interface RegistrationRequest {
  ticketId: number;
}

export interface RegistrationResponse {
  id: number;
  userId: number;
  eventId: number;
  ticketId: number;
  status: RegistrationStatus;
  confirmationCode: string;
  registeredAt: string;
  checkedInAt: string | null;
}
