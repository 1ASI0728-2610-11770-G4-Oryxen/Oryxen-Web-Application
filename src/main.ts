import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import 'primeicons/primeicons.css';
import './style.css';

import App from './App.vue';
import router from './router';
import { i18n } from '@/i18n';
import { useAuthStore } from '@/stores/auth';
import { AUTH_EXPIRED_EVENT } from '@/services/tokenStorage';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(PrimeVue, { theme: { preset: Aura } });
app.use(ToastService);
app.use(ConfirmationService);

// When the HTTP client can no longer refresh the session, drop it and return to login.
const authStore = useAuthStore();
window.addEventListener(AUTH_EXPIRED_EVENT, () => {
  authStore.logout();
  void router.push({ name: 'login' });
});

app.mount('#app');
