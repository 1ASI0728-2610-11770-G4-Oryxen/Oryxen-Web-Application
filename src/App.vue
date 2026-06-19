<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Sidebar from '@/shared/presentation/components/Sidebar.vue';
import Header from '@/shared/presentation/components/Header.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const isSidebarOpen = ref(true);

// Auth pages (login/register) render bare; the app shell (sidebar + header from the
// reconciled DDD modules) only appears once the user is authenticated.
const showShell = computed(
  () => auth.isAuthenticated && route.name !== 'login' && route.name !== 'register',
);

function toggleSidebar(): void {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<template>
  <div v-if="showShell" class="app-layout">
    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="app-layout__main">
      <Header @menu-click="toggleSidebar" />
      <main class="app-layout__content">
        <RouterView />
      </main>
    </div>
  </div>

  <RouterView v-else />
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.app-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-layout__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl, 32px);
}

@media (max-width: 768px) {
  .app-layout__content {
    padding: var(--spacing-md, 16px);
  }
}
</style>
