<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const canSubmit = computed(() => email.value.trim().length > 0 && password.value.length > 0);
const hasError = computed(() => errorMessage.value.length > 0);

async function onSubmit(): Promise<void> {
  if (!canSubmit.value) return;

  errorMessage.value = '';
  loading.value = true;
  try {
    await auth.login({ email: email.value.trim(), password: password.value });
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    await router.push(redirect);
  } catch (error) {
    errorMessage.value = resolveError(error);
  } finally {
    loading.value = false;
  }
}

function resolveError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) return t('auth.errors.invalidCredentials');
    const title = (error.response?.data as { title?: string } | undefined)?.title;
    if (title) return title;
  }
  return t('auth.errors.signInFailed');
}
</script>

<template>
  <form class="auth-form" @submit.prevent="onSubmit" novalidate>
    <label class="auth-form__field">
      <span class="auth-form__label">{{ t('auth.email') }}</span>
      <InputText
        v-model="email"
        type="email"
        autocomplete="email"
        :placeholder="t('auth.emailPlaceholder')"
        aria-required="true"
        :aria-invalid="hasError"
        fluid
      />
    </label>

    <label class="auth-form__field">
      <span class="auth-form__label">{{ t('auth.password') }}</span>
      <Password
        v-model="password"
        :feedback="false"
        toggle-mask
        autocomplete="current-password"
        :placeholder="t('auth.passwordPlaceholder')"
        :input-props="{ 'aria-required': 'true', 'aria-invalid': hasError }"
        fluid
      />
    </label>

    <Message v-if="errorMessage" severity="error" :closable="false" role="alert">{{ errorMessage }}</Message>

    <Button
      type="submit"
      :label="t('auth.signIn')"
      icon="pi pi-sign-in"
      :loading="loading"
      :disabled="!canSubmit"
      fluid
    />
  </form>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.auth-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.auth-form__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--oryxen-muted);
}
</style>
