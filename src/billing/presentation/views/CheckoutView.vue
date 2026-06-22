<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

import { billingService } from '@/billing/infrastructure/billing.service';
import type { SubscriptionInfo } from '@/billing/domain/model/billing.entity';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const status = ref<'success' | 'cancel' | 'loading' | 'none'>('none');
const subscription = ref<SubscriptionInfo | null>(null);
const confirmError = ref<string | null>(null);

onMounted(async () => {
  const queryStatus = route.query.status as string;
  if (queryStatus === 'success') {
    status.value = 'loading';
    try {
      const sub = await billingService.getCurrentSubscription();
      subscription.value = sub;
      status.value = 'success';
    } catch (err: unknown) {
      confirmError.value = err instanceof Error ? err.message : 'Failed to confirm subscription';
      status.value = 'none';
    }
  } else if (queryStatus === 'cancel') {
    status.value = 'cancel';
  }
});
</script>

<template>
  <div class="billing-checkout" role="main" aria-labelledby="checkout-title">
    <h1 id="checkout-title" class="billing-checkout__title">{{ t('billing.checkoutTitle') }}</h1>

    <div v-if="status === 'loading'" class="billing-checkout__loading" role="status" aria-live="polite">
      <ProgressSpinner />
      <p>Confirming your subscription...</p>
    </div>

    <Message v-if="status === 'success' && subscription" severity="success" :closable="false">
      {{ t('billing.checkoutSuccess') }}
      <br><strong>Plan:</strong> {{ subscription.plan }}
    </Message>

    <Message v-if="confirmError" severity="error" :closable="false">
      {{ confirmError }}
    </Message>

    <Message v-if="status === 'cancel'" severity="warn" :closable="false">
      {{ t('billing.checkoutCancel') }}
    </Message>

    <Card v-if="status === 'none'" class="billing-checkout__card">
      <template #content>
        <p>{{ t('billing.checkoutRedirect') }}</p>
      </template>
    </Card>

    <p class="billing-checkout__back">
      <a href="/billing" aria-label="Back to plans">{{ t('billing.backToPlans') }}</a>
    </p>
  </div>
</template>

<style scoped>
.billing-checkout {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}
.billing-checkout__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
}
.billing-checkout__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}
.billing-checkout__card {
  margin-bottom: 1.5rem;
}
.billing-checkout__back a {
  color: var(--primary-green, #22c55e);
  text-decoration: underline;
}
</style>
