<template>
  <div class="plant-form-card">
    <Button
        icon="pi pi-arrow-left"
        :label="t('plants.form.back')"
        text
        @click="goBack"
        class="back-button"
    />
    <h2 class="form-title">{{ t('plants.form.addTitle') }}</h2>

    <form @submit.prevent="onSubmit" class="form-grid" novalidate>
      <div class="field">
        <label for="name">{{ t('plants.form.name') }}</label>
        <InputText
            id="name"
            v-model="form.name"
            :placeholder="t('plants.form.namePlaceholder')"
            aria-required="true"
            :aria-invalid="!!errors.name"
        />
        <small v-if="errors.name" class="error" role="alert">{{ errors.name }}</small>
      </div>

      <div class="field">
        <label for="type">{{ t('plants.form.type') }}</label>
        <InputText
            id="type"
            v-model="form.type"
            :placeholder="t('plants.form.typePlaceholder')"
            aria-required="true"
            :aria-invalid="!!errors.type"
        />
        <small v-if="errors.type" class="error" role="alert">{{ errors.type }}</small>
      </div>

      <div class="field">
        <label for="imgUrl">{{ t('plants.form.imageUrl') }}</label>
        <InputText id="imgUrl" v-model="form.imgUrl" placeholder="https://..." />
        <small class="hint">{{ t('plants.form.imageHint') }}</small>
      </div>

      <div class="field">
        <label for="location">{{ t('plants.form.location') }}</label>
        <InputText id="location" v-model="form.location" :placeholder="t('plants.form.locationPlaceholder')" />
      </div>

      <div class="field full">
        <label for="bio">{{ t('plants.form.bio') }}</label>
        <Textarea id="bio" v-model="form.bio" rows="4" :placeholder="t('plants.form.bioPlaceholder')" />
      </div>

      <div v-if="serverError.message" class="server-error" role="alert">{{ serverError.message }}</div>

      <div class="actions">
        <Button type="button" class="btn-ghost" @click="onReset">{{ t('plants.form.reset') }}</Button>
        <Button type="submit" class="btn-primary">{{ t('plants.form.save') }}</Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthenticationStore } from '../../../iam/services/Authentication.Store';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { PlantsService } from '../../infrastructure/plants.services';
import type { Plant } from '../../domain/model/plants.entity';

const { t } = useI18n();
const router = useRouter();
const plantsService = new PlantsService();

const authStore = useAuthenticationStore();

const emptyState = (): Partial<Plant> => ({
  name: '',
  type: '',
  imgUrl: '',
  bio: '',
  location: ''
});

const form = reactive<Partial<Plant>>({ ...emptyState() });
const errors = reactive<Record<string, string>>({});
const serverError = reactive<{ message: string | null }>({ message: null });

const validate = () => {
  errors.name = form.name && form.name.trim() ? '' : t('plants.form.nameRequired');
  errors.type = form.type && form.type.trim() ? '' : t('plants.form.typeRequired');
  return !Object.values(errors).some(v => v);
};

const onSubmit = async () => {
  serverError.message = null;
  if (!validate()) return;

  if (!authStore.isSignedIn || !authStore.token) {
    serverError.message = t('plants.form.mustSignIn');
    setTimeout(() => router.push({ name: 'SignIn' }), 2000);
    return;
  }

  const userId = authStore.uuid;
  if (!userId) {
    serverError.message = t('plants.form.noUser');
    return;
  }

  const payload = {
    userId,
    name: String(form.name || '').trim(),
    type: String(form.type || '').trim(),
    imgUrl: String(form.imgUrl || '').trim() || 'https://via.placeholder.com/180',
    bio: String(form.bio || '').trim(),
    location: String(form.location || '').trim()
  };

  try {
    const createResponse = await plantsService.createPlant(payload);
    const newPlantId = createResponse.data.id;
    if (newPlantId) {
      const now = new Date().toISOString();
      await plantsService.waterPlant(newPlantId, now);
    }
    router.push('/plants');
  } catch (err: any) {
    if (err?.response?.status === 401) {
      serverError.message = t('plants.form.sessionExpired');
      setTimeout(() => {
        authStore.signOut();
        router.push({ name: 'SignIn' });
      }, 2000);
    } else if (err?.response?.status === 403) {
      serverError.message = t('plants.form.noPermission');
    } else if (err?.response?.status === 400) {
      const backendMsg = err?.response?.data?.title || err?.response?.data?.message || err?.response?.data || 'Invalid data';
      serverError.message = t('plants.form.validationError', { msg: backendMsg });
    } else {
      const backendMsg = err?.response?.data?.title || err?.response?.data?.message || err?.message || 'Unknown error';
      serverError.message = t('plants.form.genericError', { msg: backendMsg });
    }
  }
};

const onReset = () => {
  Object.assign(form, emptyState());
};

const goBack = () => {
  router.push('/plants');
};
</script>

<style scoped>
.plant-form-card {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  text-align: center;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.field.full {
  width: 100%;
}

.field label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.hint {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.error {
  color: var(--status-critical);
  font-size: 12px;
  margin-top: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.btn-primary {
  background: var(--primary-green) !important;
  color: #fff !important;
  border: none !important;
  padding: 10px 18px;
  border-radius: var(--radius-md);
}

.btn-ghost {
  background: transparent !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-secondary) !important;
  padding: 10px 14px;
  border-radius: var(--radius-md);
}

.server-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(255,0,0,0.06);
  border: 1px solid rgba(255,0,0,0.12);
  color: var(--status-critical);
  border-radius: 6px;
  font-size: 13px;
}

.back-button {
  align-self: flex-start;
  margin-bottom: var(--spacing-md);
}

@media (max-width: 600px) {
  .plant-form-card {
    max-width: 100%;
    padding: var(--spacing-md);
  }
  .form-grid {
    gap: var(--spacing-sm);
  }
}
</style>
