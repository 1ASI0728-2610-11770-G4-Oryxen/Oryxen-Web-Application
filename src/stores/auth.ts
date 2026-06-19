import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/services/tokenStorage';
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload, UserRole } from '@/types/auth';

/**
 * Authentication store (Composition API setup style). Holds the reactive session and
 * orchestrates register / login / logout, mirroring the token pair into localStorage
 * via {@link tokenStorage} so it survives reloads and is reachable by the HTTP client.
 */
export const useAuthStore = defineStore('auth', () => {
  // --- State -----------------------------------------------------------------
  const user = ref<AuthUser | null>(tokenStorage.getUser());
  const accessToken = ref<string | null>(tokenStorage.getAccessToken());

  // --- Getters ---------------------------------------------------------------
  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const roles = computed<UserRole[]>(() => user.value?.roles ?? []);
  const isAdmin = computed(() => roles.value.includes('ADMIN'));
  const isFarmer = computed(() => roles.value.includes('FARMER'));
  const canReadTelemetry = computed(() => isFarmer.value || isAdmin.value);

  // --- Internal helpers ------------------------------------------------------
  function applySession(response: AuthResponse): void {
    user.value = {
      email: response.email,
      fullName: response.fullName,
      roles: response.roles,
    };
    accessToken.value = response.accessToken;

    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    tokenStorage.setUser(user.value);
  }

  // --- Actions ---------------------------------------------------------------
  async function register(payload: RegisterPayload): Promise<void> {
    applySession(await authService.register(payload));
  }

  async function login(payload: LoginPayload): Promise<void> {
    applySession(await authService.login(payload));
  }

  function logout(): void {
    user.value = null;
    accessToken.value = null;
    tokenStorage.clear();
  }

  /** Re-hydrates the reactive state from localStorage (e.g. after a background refresh). */
  function syncFromStorage(): void {
    user.value = tokenStorage.getUser();
    accessToken.value = tokenStorage.getAccessToken();
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    roles,
    isAdmin,
    isFarmer,
    canReadTelemetry,
    register,
    login,
    logout,
    syncFromStorage,
  };
});
