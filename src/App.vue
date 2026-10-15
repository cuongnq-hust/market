<script setup lang="ts">
import AppHeader from './components/common/AppHeader.vue';
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-gray-50 text-gray-900 font-sans overflow-hidden">
    <AppHeader />
    <router-view />
  </div>
</template>
