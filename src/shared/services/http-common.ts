// Reconciled connector: the shared HTTP client now delegates to the centralized
// Phase 3 `apiClient` so every module (analytics, plants, ...) inherits the JWT
// Bearer interceptor, single-flight refresh and the unified `:5170/api/v1` base URL.
import { apiClient } from '@/services/httpClient';

export default apiClient;
