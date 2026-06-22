<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import RegisterForm from '@/components/auth/RegisterForm.vue';

const { t } = useI18n();
</script>

<template>
  <section class="auth-page">
    <div class="auth-page__card">
      <div class="auth-page__brand">
        <img src="@/assets/logo.svg" :alt="t('auth.logoAlt')" class="auth-page__logo" />
        <h1 class="auth-page__title">{{ t('common.appName') }}</h1>
      </div>
      <p class="auth-page__subtitle">{{ t('auth.registerSubtitle') }}</p>

      <RegisterForm />

      <p class="auth-page__alt">
        {{ t('auth.haveAccount') }}
        <RouterLink to="/login">{{ t('auth.signInLink') }}</RouterLink>
      </p>

      <p class="auth-page__legal">
        <RouterLink to="/terms">{{ t('terms.title') }}</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-page__card {
  width: 100%;
  max-width: 22rem;
  background-color: var(--oryxen-card);
  border: 1px solid var(--oryxen-border);
  border-radius: 1rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.auth-page__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.auth-page__logo {
  width: 32px;
  height: 32px;
}

.auth-page__title {
  font-size: 1.6rem;
  color: var(--oryxen-accent);
}

.auth-page__subtitle {
  text-align: center;
  color: var(--oryxen-muted);
  margin: 0.4rem 0 1.6rem;
  font-size: 0.9rem;
}

.auth-page__alt {
  text-align: center;
  font-size: 0.85rem;
  margin-top: 1.2rem;
  color: var(--oryxen-muted);
}

.auth-page__alt a {
  color: var(--oryxen-primary-strong);
  font-weight: 600;
  text-decoration: none;
}

.auth-page__legal {
  text-align: center;
  font-size: 0.75rem;
  margin-top: 0.8rem;
}

.auth-page__legal a {
  color: var(--oryxen-muted);
  text-decoration: underline;
}
</style>
