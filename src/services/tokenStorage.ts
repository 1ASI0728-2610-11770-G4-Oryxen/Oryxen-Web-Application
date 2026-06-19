import type { AuthUser } from '@/types/auth';

/**
 * Single source of truth for the persisted session. Tokens live in localStorage so
 * the session survives page reloads. NOTE: localStorage is readable by any script on
 * the page; acceptable for this local academic build, but a production deployment
 * should prefer httpOnly cookies for the refresh token.
 */
const ACCESS_TOKEN_KEY = 'oryxen.accessToken';
const REFRESH_TOKEN_KEY = 'oryxen.refreshToken';
const USER_KEY = 'oryxen.user';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

/** Event dispatched on the window when the session can no longer be refreshed. */
export const AUTH_EXPIRED_EVENT = 'oryxen:auth-expired';
