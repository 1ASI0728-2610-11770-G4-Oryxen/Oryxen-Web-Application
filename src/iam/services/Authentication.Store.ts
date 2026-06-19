import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { tokenStorage } from '@/services/tokenStorage';

/**
 * Compatibility adapter for the DDD `plants` module.
 *
 * The teammate's `plants` bounded context expected an `iam` Authentication store that
 * was never committed. Rather than modifying their components, this shim exposes the
 * same surface (`isSignedIn`, `token`, `uuid`, `signOut`) backed by the reconciled
 * Phase 3 auth store, so the JWT issued by the .NET backend drives the plants flow too.
 */
export const useAuthenticationStore = defineStore('iam-authentication', () => {
  const auth = useAuthStore();

  const isSignedIn = computed(() => auth.isAuthenticated);
  const token = computed(() => tokenStorage.getAccessToken() ?? '');
  // The backend currently issues identity by email; `userUuid` is kept for forward
  // compatibility once a dedicated user id is returned by the API.
  const uuid = computed(() => localStorage.getItem('userUuid') ?? auth.user?.email ?? '');

  function signOut(): void {
    auth.logout();
  }

  return { isSignedIn, token, uuid, signOut };
});
