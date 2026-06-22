<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
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

const fullName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const passwordTooShort = computed(() => password.value.length > 0 && password.value.length < 8);
const canSubmit = computed(
  () => fullName.value.trim().length > 0 && email.value.trim().length > 0 && password.value.length >= 8,
);
const hasError = computed(() => errorMessage.value.length > 0);

async function onSubmit(): Promise<void> {
  if (!canSubmit.value) return;

  errorMessage.value = '';
  loading.value = true;
  try {
    await auth.register({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      password: password.value,
    });
    await router.push('/dashboard');
  } catch (error) {
    errorMessage.value = resolveError(error);
  } finally {
    loading.value = false;
  }
}

function resolveError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.status === 409) return t('auth.errors.emailExists');
    const title = (error.response?.data as { title?: string } | undefined)?.title;
    if (title) return title;
  }
  return t('auth.errors.registerFailed');
}
</script>

<template>
  <form class="auth-form" @submit.prevent="onSubmit" novalidate>
    <label class="auth-form__field">
      <span class="auth-form__label">{{ t('auth.fullName') }}</span>
      <InputText
        v-model="fullName"
        autocomplete="name"
        :placeholder="t('auth.fullNamePlaceholder')"
        aria-required="true"
        :aria-invalid="hasError"
        fluid
      />
    </label>

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
        toggle-mask
        autocomplete="new-password"
        :placeholder="t('auth.newPasswordPlaceholder')"
        :input-props="{ 'aria-required': 'true', 'aria-invalid': hasError || passwordTooShort }"
        fluid
      />
      <small v-if="passwordTooShort" class="auth-form__hint" role="alert">
        {{ t('auth.passwordTooShort') }}
      </small>
    </label>

    <Message v-if="errorMessage" severity="error" :closable="false" role="alert">{{ errorMessage }}</Message>

    <Button
      type="submit"
      :label="t('auth.createAccount')"
      icon="pi pi-user-plus"
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

.auth-form__hint {
  color: var(--oryxen-critical);
  font-size: 0.78rem;
}
</style>
