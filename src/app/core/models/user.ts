import { UserRole } from './enums';

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
}

export interface UserUpdateRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export type User = UserResponse;
