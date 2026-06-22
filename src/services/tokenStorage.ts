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

/** Decodes a JWT payload (base64url) without verifying the signature. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

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

  /** Returns the authenticated user's id (Guid) from the access token's `sub` claim. */
  getUserId(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    const sub = payload?.['sub'];
    return typeof sub === 'string' ? sub : null;
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
