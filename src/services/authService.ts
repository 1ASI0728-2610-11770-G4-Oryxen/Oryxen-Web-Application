import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth';
import { apiClient, rawClient } from './httpClient';

/** Thin wrapper over the backend Auth & Identity endpoints (`/api/v1/auth`). */
export const authService = {
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return rawClient.post<AuthResponse>('/auth/register', payload).then((r) => r.data);
  },

  login(payload: LoginPayload): Promise<AuthResponse> {
    return rawClient.post<AuthResponse>('/auth/login', payload).then((r) => r.data);
  },

  refresh(refreshToken: string): Promise<AuthResponse> {
    return rawClient.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data);
  },

  me(): Promise<AuthUser> {
    return apiClient.get<AuthUser>('/auth/me').then((r) => r.data);
  },
};
