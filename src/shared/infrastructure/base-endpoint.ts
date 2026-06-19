import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/httpClient';

/**
 * Reconciled BaseApi: instead of creating its own axios instance against the old
 * json-server URL, it exposes the centralized `apiClient` (JWT Bearer + refresh,
 * base URL `http://localhost:5170/api/v1`). Existing services keep working unchanged.
 */
export class BaseApi {
  public get http(): AxiosInstance {
    return apiClient;
  }
}

export const ENDPOINTS = {
  PLANTS: '/plants',
  ANALYTICS: '/analytics',
  USERS: '/users',
  PROFILES: '/profiles',
  POSTS: '/posts',
  COMMENTS: '/comments',
  REACTIONS: '/reactions',
  PLANTREPORTS: '/plantReports',
  AUTH_REGISTER: '/auth/register',
};
