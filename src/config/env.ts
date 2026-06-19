/**
 * Centralized access to build-time environment variables.
 * Defined in `.env.development` / `.env.production` (Vite `VITE_` prefix).
 */
export const env = {
  /** Base URL of the Oryxen .NET backend, e.g. http://localhost:5170/api/v1 */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5170/api/v1',
} as const;
