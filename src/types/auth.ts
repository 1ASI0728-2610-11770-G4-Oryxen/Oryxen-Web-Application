export type UserRole = 'FARMER' | 'ADMIN' | 'SUPPORT_TECHNICIAN';

export interface AuthUser {
  email: string;
  fullName: string;
  roles: UserRole[];
}

/** Shape returned by the backend auth endpoints (register / login / refresh). */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  email: string;
  fullName: string;
  roles: UserRole[];
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
