<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { useAuthStore } from '@/stores/auth';

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
    if (error.response?.status === 409) return 'An account with this email already exists.';
    const title = (error.response?.data as { title?: string } | undefined)?.title;
    if (title) return title;
  }
  return 'Unable to create the account. Please try again.';
}
</script>

<template>
  <form class="auth-form" @submit.prevent="onSubmit">
    <label class="auth-form__field">
      <span class="auth-form__label">Full name</span>
      <InputText v-model="fullName" autocomplete="name" placeholder="Abraham Estrada" fluid />
    </label>

    <label class="auth-form__field">
      <span class="auth-form__label">Email</span>
      <InputText
        v-model="email"
        type="email"
        autocomplete="email"
        placeholder="you@oryxen.io"
        fluid
      />
    </label>

    <label class="auth-form__field">
      <span class="auth-form__label">Password</span>
      <Password
        v-model="password"
        toggle-mask
        autocomplete="new-password"
        placeholder="At least 8 characters"
        fluid
      />
      <small v-if="passwordTooShort" class="auth-form__hint">
        Password must be at least 8 characters.
      </small>
    </label>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <Button
      type="submit"
      label="Create account"
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
