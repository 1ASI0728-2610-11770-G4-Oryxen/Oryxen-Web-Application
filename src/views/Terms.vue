<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const sections = [
  { id: 'use', title: 'terms.s1Title', body: 'terms.s1Body' },
  { id: 'accounts', title: 'terms.s2Title', body: 'terms.s2Body' },
  { id: 'billing', title: 'terms.s3Title', body: 'terms.s3Body' },
  { id: 'privacy', title: 'terms.s4Title', body: 'terms.s4Body' },
  { id: 'ethics', title: 'terms.s5Title', body: 'terms.s5Body' },
  { id: 'contact', title: 'terms.s6Title', body: 'terms.s6Body' },
];

const goBack = () => router.back();
</script>

<template>
  <article class="terms" aria-labelledby="terms-title">
    <div class="terms__card">
      <h1 id="terms-title" class="terms__title">{{ t('terms.title') }}</h1>
      <p class="terms__subtitle">{{ t('terms.subtitle') }}</p>
      <p class="terms__updated">{{ t('terms.lastUpdated') }}</p>

      <p class="terms__intro">{{ t('terms.intro') }}</p>

      <section v-for="s in sections" :id="s.id" :key="s.id" class="terms__section">
        <h2 class="terms__heading">{{ t(s.title) }}</h2>
        <p class="terms__body">{{ t(s.body) }}</p>
      </section>

      <button type="button" class="terms__back" @click="goBack">
        <span aria-hidden="true">←</span> {{ t('terms.backHome') }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.terms {
  display: block;
  padding: 2rem 1rem;
}

.terms__card {
  max-width: 760px;
  margin: 0 auto;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  color: var(--text-primary, #111827);
}

.terms__title {
  font-size: 1.9rem;
  font-weight: 800;
  margin: 0 0 0.4rem;
}

.terms__subtitle {
  color: var(--text-secondary, #6b7280);
  margin: 0 0 0.25rem;
}

.terms__updated {
  font-size: 0.8rem;
  color: var(--text-light, #9ca3af);
  margin: 0 0 1.5rem;
}

.terms__intro {
  margin: 0 0 1.5rem;
  line-height: 1.7;
}

.terms__section {
  margin-bottom: 1.4rem;
  scroll-margin-top: 2rem;
}

.terms__heading {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
}

.terms__body {
  margin: 0;
  line-height: 1.7;
  color: var(--text-secondary, #374151);
}

.terms__back {
  margin-top: 1.5rem;
  padding: 0.7rem 1.4rem;
  background: var(--primary-green, #22c55e);
  color: #ffffff;
  border: none;
  border-radius: 0.6rem;
  font-weight: 600;
  cursor: pointer;
}

.terms__back:hover {
  filter: brightness(0.95);
}
</style>
