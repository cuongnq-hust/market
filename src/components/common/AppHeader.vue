<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  Navigation,
  Map,
  List,
  RotateCcw,
  Sparkles,
  MessageSquareQuote,
  Compass,
} from 'lucide-vue-next';
import { useGeolocation } from '../../composables/useGeolocation';
import { useNearbyFilter } from '../../composables/useNearbyFilter';

const route = useRoute();

const {
  isLocating,
  isCustomLocation,
  requestCurrentLocation,
  resetToDefaultCenter,
} = useGeolocation();

const { viewMode, nearbySellers } = useNearbyFilter();
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-2">
        <!-- 1. Brand & Logo -->
        <router-link to="/" class="flex items-center space-x-2.5 shrink-0 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            <Sparkles class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-black text-gray-900 leading-tight flex items-center gap-1.5">
              Pass Đồ Gần Nhà
              <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full uppercase tracking-wider hidden sm:inline">Hà Nội</span>
            </h1>
            <p class="text-[11px] text-gray-400 hidden sm:block">Thu mua & thanh lý đồ cũ theo vị trí</p>
          </div>
        </router-link>

        <!-- 2. Main Navigation Tabs (Bản đồ vs Diễn đàn) -->
        <nav class="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
          <router-link
            to="/"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition"
            :class="route.path === '/' 
              ? 'bg-white text-brand-700 shadow-xs' 
              : 'text-gray-600 hover:text-gray-900'"
          >
            <Compass class="w-4 h-4" />
            <span>Bản đồ shop</span>
          </router-link>

          <router-link
            to="/community"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition"
            :class="route.path === '/community' 
              ? 'bg-white text-orange-600 shadow-xs' 
              : 'text-gray-600 hover:text-gray-900'"
          >
            <MessageSquareQuote class="w-4 h-4" />
            <span>Diễn đàn</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 font-extrabold hidden md:inline">
              Mới
            </span>
          </router-link>
        </nav>

        <!-- 3. Actions Row (Only on Home Map View) -->
        <div v-if="route.path === '/'" class="flex items-center space-x-2 shrink-0">
          <!-- GPS Location button -->
          <button
            @click="requestCurrentLocation"
            :disabled="isLocating"
            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition border shadow-xs"
            :class="isLocating 
              ? 'bg-blue-50 text-blue-500 border-blue-200 cursor-wait' 
              : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-400 active:scale-95'"
            title="Lấy vị trí GPS từ trình duyệt"
          >
            <Navigation class="w-3.5 h-3.5" :class="{ 'animate-spin': isLocating }" />
            <span class="hidden sm:inline">{{ isLocating ? 'Đang định vị...' : 'Vị trí của tôi' }}</span>
          </button>

          <!-- Reset custom location -->
          <button
            v-if="isCustomLocation"
            @click="resetToDefaultCenter"
            class="p-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            title="Đặt lại về trung tâm Hồ Hoàn Kiếm"
          >
            <RotateCcw class="w-3.5 h-3.5" />
          </button>

          <!-- Map vs List Toggle -->
          <div class="hidden md:flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              @click="viewMode = 'map'"
              class="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition"
              :class="viewMode === 'map' ? 'bg-white text-brand-700 shadow-2xs' : 'text-gray-500 hover:text-gray-800'"
            >
              <Map class="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              @click="viewMode = 'list'"
              class="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition"
              :class="viewMode === 'list' ? 'bg-white text-brand-700 shadow-2xs' : 'text-gray-500 hover:text-gray-800'"
            >
              <List class="w-3.5 h-3.5" />
              <span>List ({{ nearbySellers.length }})</span>
            </button>
          </div>
        </div>

        <!-- 4. Community shortcut if on /community -->
        <div v-else class="flex items-center gap-2">
          <router-link
            to="/"
            class="hidden sm:inline-flex items-center gap-1 text-xs text-brand-700 font-semibold hover:underline"
          >
            ← Xem bản đồ kho hàng
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
