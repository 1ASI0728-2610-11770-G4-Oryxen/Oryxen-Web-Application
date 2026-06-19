import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/httpClient';

/**
 * Reconciled BaseApi: delegates to the centralized `apiClient` (JWT Bearer + refresh,
 * unified `:5170/api/v1` base URL) instead of building its own axios instance.
 */
export class BaseApi {
  public get http(): AxiosInstance {
    return apiClient;
  }
}
