<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from './components/common/AppHeader.vue';
import WishlistModal from './components/common/WishlistModal.vue';
import PwaInstallModal from './components/common/PwaInstallModal.vue';
import ReportModal from './components/common/ReportModal.vue';
import { initRealtimeSync } from './services/realtimeSync';

onMounted(() => {
  initRealtimeSync();
});
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-gradient-to-br from-[#f0f6fc] via-[#edf3fa] to-[#f5f9fd] text-slate-800 font-sans overflow-hidden">
    <AppHeader />
    <router-view />
    <WishlistModal />
    <PwaInstallModal />
    <ReportModal />
  </div>
</template>
