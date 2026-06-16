<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './shared/presentation/components/Sidebar.vue';
import Header from './shared/presentation/components/Header.vue';

const route = useRoute();
const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="app-layout">
    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="main-wrapper">
      <Header @menu-click="toggleSidebar" />

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
}

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-md);
  }
}
</style>