<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Message from 'primevue/message';

const { t } = useI18n();
const route = useRoute();

const status = ref<'success' | 'cancel' | 'none'>('none');

onMounted(() => {
  const queryStatus = route.query.status as string;
  if (queryStatus === 'success') status.value = 'success';
  else if (queryStatus === 'cancel') status.value = 'cancel';
});
</script>

<template>
  <div class="billing-checkout" role="main" aria-labelledby="checkout-title">
    <h1 id="checkout-title" class="billing-checkout__title">{{ t('billing.checkoutTitle') }}</h1>

    <Message v-if="status === 'success'" severity="success" :closable="false">
      {{ t('billing.checkoutSuccess') }}
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
.billing-checkout__card {
  margin-bottom: 1.5rem;
}
.billing-checkout__back a {
  color: var(--primary-green, #22c55e);
  text-decoration: underline;
}
</style>
