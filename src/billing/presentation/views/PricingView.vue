<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

import { billingService } from '@/billing/infrastructure/billing.service';
import type { Plan } from '@/billing/domain/model/billing.entity';

const { t } = useI18n();
const toast = useToast();

const plans = ref<Plan[]>([]);
const loading = ref(false);
const checkoutLoading = ref<string | null>(null);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    plans.value = await billingService.getPlans();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load plans';
  } finally {
    loading.value = false;
  }
});

async function upgrade(plan: Plan) {
  checkoutLoading.value = plan.id;
  try {
    const result = await billingService.createCheckout({
      planId: plan.id,
      successUrl: `${window.location.origin}/billing/checkout?status=success`,
      cancelUrl: `${window.location.origin}/billing/checkout?status=cancel`,
    });
    window.location.href = result.checkoutUrl;
  } catch (err: unknown) {
    toast.add({
      severity: 'error',
      summary: t('billing.checkoutFailed'),
      detail: err instanceof Error ? err.message : 'Unknown error',
      life: 5000,
    });
  } finally {
    checkoutLoading.value = null;
  }
}

function parseFeatures(features: string): string[] {
  return features.split(',').map((f) => f.trim()).filter(Boolean);
}

function isPremium(plan: Plan): boolean {
  return plan.name.toLowerCase().includes('premium');
}
</script>

<template>
  <div class="billing-pricing" role="main" aria-labelledby="billing-title">
    <h1 id="billing-title" class="billing-pricing__title">{{ t('billing.title') }}</h1>
    <p class="billing-pricing__subtitle">{{ t('billing.subtitle') }}</p>

    <div v-if="loading" class="billing-pricing__loading" role="status" aria-live="polite">
      <ProgressSpinner />
      <p>{{ t('billing.loading') }}</p>
    </div>

    <Message v-if="error && !loading" severity="error" :closable="false">
      {{ error }}
    </Message>

    <div v-if="!loading && plans.length > 0" class="billing-pricing__grid">
      <Card
        v-for="plan in plans"
        :key="plan.id"
        :class="['billing-pricing__card', { 'billing-pricing__card--featured': isPremium(plan) }]"
      >
        <template #title>
          <div class="billing-pricing__card-header">
            <span>{{ plan.name }}</span>
            <Tag v-if="isPremium(plan)" :value="t('billing.popular')" severity="success" />
          </div>
        </template>
        <template #content>
          <div class="billing-pricing__price">
            <span class="billing-pricing__amount">{{ plan.currency }} {{ plan.price.toFixed(2) }}</span>
            <span class="billing-pricing__period">/ {{ t('billing.month') }}</span>
          </div>
          <ul class="billing-pricing__features">
            <li v-for="feature in parseFeatures(plan.features)" :key="feature" class="billing-pricing__feature">
              <span aria-hidden="true">✓</span> {{ feature }}
            </li>
          </ul>
          <Button
            :label="isPremium(plan) ? t('billing.upgrade') : t('billing.currentPlan')"
            :icon="isPremium(plan) ? 'pi pi-arrow-up' : 'pi pi-check'"
            :loading="checkoutLoading === plan.id"
            :disabled="!isPremium(plan) || checkoutLoading !== null"
            :class="{ 'billing-pricing__cta--featured': isPremium(plan) }"
            :aria-label="isPremium(plan) ? t('billing.upgrade') : t('billing.currentPlan')"
            class="billing-pricing__cta"
            @click="upgrade(plan)"
          />
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.billing-pricing {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}
.billing-pricing__title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
}
.billing-pricing__subtitle {
  color: var(--text-secondary, #6b7280);
  margin: 0 0 2rem;
}
.billing-pricing__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}
.billing-pricing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}
.billing-pricing__card {
  display: flex;
  flex-direction: column;
}
.billing-pricing__card--featured {
  border: 2px solid var(--primary-green, #22c55e);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
}
.billing-pricing__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.billing-pricing__price {
  margin-bottom: 1.5rem;
}
.billing-pricing__amount {
  font-size: 2rem;
  font-weight: 800;
}
.billing-pricing__period {
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
}
.billing-pricing__features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
}
.billing-pricing__feature {
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border-color, #f3f4f6);
}
.billing-pricing__feature:last-child {
  border-bottom: none;
}
.billing-pricing__cta {
  width: 100%;
}
.billing-pricing__cta--featured {
  background: var(--primary-green, #22c55e) !important;
  border-color: var(--primary-green, #22c55e) !important;
  color: #fff !important;
}
</style>
