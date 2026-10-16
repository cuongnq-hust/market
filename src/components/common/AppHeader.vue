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
  Heart,
  Smartphone,
} from 'lucide-vue-next';
import { useGeolocation } from '../../composables/useGeolocation';
import { useNearbyFilter } from '../../composables/useNearbyFilter';
import { useFavorites } from '../../composables/useFavorites';
import { usePwaInstall } from '../../composables/usePwaInstall';

const route = useRoute();

const {
  isLocating,
  isCustomLocation,
  requestCurrentLocation,
  resetToDefaultCenter,
} = useGeolocation();

const { viewMode, nearbySellers } = useNearbyFilter();
const { favoritesCount, isWishlistModalOpen } = useFavorites();
const { isInstalled, promptInstall } = usePwaInstall();
</script>

<template>
  <header class="bg-white/90 backdrop-blur-md border-b border-blue-100/80 sticky top-0 z-30 shadow-[0_2px_12px_rgba(37,99,235,0.04)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-2">
        <!-- 1. Brand & Logo -->
        <router-link to="/" class="flex items-center space-x-2.5 shrink-0 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition">
            <Sparkles class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-black text-slate-900 leading-tight flex items-center gap-1.5">
              Pass Đồ Gần Nhà
              <span class="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 px-1.5 py-0.2 rounded-full uppercase tracking-wider hidden sm:inline">Hà Nội</span>
            </h1>
            <p class="text-[11px] text-slate-400 hidden sm:block">Thu mua & thanh lý đồ cũ theo vị trí</p>
          </div>
        </router-link>

        <!-- 2. Main Navigation Tabs (Bản đồ vs Diễn đàn) -->
        <nav class="flex items-center bg-blue-50/70 p-1 rounded-xl border border-blue-100/90 text-xs font-bold">
          <router-link
            to="/"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition"
            :class="route.path === '/' 
              ? 'bg-white text-blue-700 shadow-xs border border-blue-100/60' 
              : 'text-slate-600 hover:text-blue-700'"
          >
            <Compass class="w-4 h-4" />
            <span>Bản đồ shop</span>
          </router-link>

          <router-link
            to="/community"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition"
            :class="route.path === '/community' 
              ? 'bg-white text-blue-700 shadow-xs border border-blue-100/60' 
              : 'text-slate-600 hover:text-blue-700'"
          >
            <MessageSquareQuote class="w-4 h-4" />
            <span>Diễn đàn</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-extrabold hidden md:inline">
              Mới
            </span>
          </router-link>
        </nav>

        <!-- 3. Actions Row -->
        <div class="flex items-center space-x-2 shrink-0">
          <!-- Wishlist / Saved Items Button (Always available) -->
          <button
            @click="isWishlistModalOpen = true"
            class="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 transition active:scale-95 shadow-2xs"
            title="Xem danh sách món đồ & bài đăng đã lưu"
          >
            <Heart class="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span class="hidden md:inline">Đã lưu</span>
            <span
              v-if="favoritesCount > 0"
              class="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-600 text-white leading-none shadow-xs"
            >
              {{ favoritesCount }}
            </span>
          </button>

          <!-- PWA Install Button -->
          <button
            v-if="!isInstalled"
            @click="promptInstall"
            class="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 transition active:scale-95 shadow-2xs"
            title="Cài đặt ứng dụng vào màn hình điện thoại"
          >
            <Smartphone class="w-3.5 h-3.5 text-blue-600" />
            <span class="hidden md:inline">Cài App</span>
          </button>

          <template v-if="route.path === '/'">
            <!-- GPS Location button -->
            <button
              @click="requestCurrentLocation"
              :disabled="isLocating"
              class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition border shadow-xs"
              :class="isLocating 
                ? 'bg-blue-50 text-blue-500 border-blue-200 cursor-wait' 
                : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300 active:scale-95'"
              title="Lấy vị trí GPS từ trình duyệt"
            >
              <Navigation class="w-3.5 h-3.5" :class="{ 'animate-spin': isLocating }" />
              <span class="hidden sm:inline">{{ isLocating ? 'Đang định vị...' : 'Vị trí của tôi' }}</span>
            </button>

            <!-- Reset custom location -->
            <button
              v-if="isCustomLocation"
              @click="resetToDefaultCenter"
              class="p-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded-lg transition"
              title="Đặt lại về trung tâm Hồ Hoàn Kiếm"
            >
              <RotateCcw class="w-3.5 h-3.5" />
            </button>

            <!-- Map vs List Toggle -->
            <div class="hidden md:flex items-center bg-blue-50/70 p-0.5 rounded-lg border border-blue-100">
              <button
                @click="viewMode = 'map'"
                class="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition"
                :class="viewMode === 'map' ? 'bg-white text-blue-700 shadow-2xs border border-blue-100/60' : 'text-slate-500 hover:text-slate-800'"
              >
                <Map class="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                @click="viewMode = 'list'"
                class="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition"
                :class="viewMode === 'list' ? 'bg-white text-blue-700 shadow-2xs border border-blue-100/60' : 'text-slate-500 hover:text-slate-800'"
              >
                <List class="w-3.5 h-3.5" />
                <span>List ({{ nearbySellers.length }})</span>
              </button>
            </div>
          </template>

          <!-- Community shortcut if on /community -->
          <router-link
            v-else
            to="/"
            class="hidden sm:inline-flex items-center gap-1 text-xs text-brand-700 font-semibold hover:underline"
          >
            ← Bản đồ kho hàng
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
