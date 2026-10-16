<script setup lang="ts">
import {
  Search,
  SlidersHorizontal,
  Clock,
  Layers,
  MapPin,
  X,
  Plus,
  Store,
  Package,
  Sparkles,
} from 'lucide-vue-next';
import { useNearbyFilter } from '../../composables/useNearbyFilter';
import { useGeolocation } from '../../composables/useGeolocation';
import { CATEGORIES } from '../../utils/constants';

const {
  filters,
  nearbySellers,
  nearbyProducts,
  isRegisterModalOpen,
  isMyListingsModalOpen,
} = useNearbyFilter();

const { isCustomLocation } = useGeolocation();

const clearSearch = () => {
  filters.searchQuery = '';
};
</script>

<template>
  <div class="bg-white/90 backdrop-blur-md border-b border-blue-100/80 px-3 sm:px-6 py-2.5 shadow-[0_2px_10px_rgba(37,99,235,0.03)] z-20">
    <div class="max-w-7xl mx-auto flex flex-col gap-2.5">
      <!-- Top Row: Search Input + Category Select + Seller Type Select + Quick CTAs -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <!-- Search Input -->
        <div class="relative md:col-span-4">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search class="h-4 w-4" />
          </div>
          <input
            v-model="filters.searchQuery"
            type="text"
            placeholder="Tìm theo tên shop, món đồ cũ, ve chai..."
            class="block w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm border border-blue-100 rounded-xl bg-blue-50/30 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all outline-none"
          />
          <button
            v-if="filters.searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Category Dropdown -->
        <div class="relative md:col-span-3">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Layers class="h-4 w-4" />
          </div>
          <select
            v-model="filters.category"
            class="block w-full pl-9 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm border border-blue-100 rounded-xl bg-blue-50/30 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all outline-none appearance-none"
          >
            <option value="all">📦 Tất cả danh mục</option>
            <option v-for="cat in CATEGORIES" :key="cat.key" :value="cat.key">
              {{ cat.label }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>

        <!-- Seller Type Filter (Store vs Individual) -->
        <div class="relative md:col-span-2">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Store class="h-3.5 w-3.5" />
          </div>
          <select
            v-model="filters.sellerType"
            class="block w-full pl-8 pr-6 py-1.5 sm:py-2 text-xs sm:text-sm border border-blue-100 rounded-xl bg-blue-50/30 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none appearance-none"
          >
            <option value="all">👥 Tất cả người bán</option>
            <option value="individual">👤 Cá nhân pass đồ</option>
            <option value="store">🏪 Vựa thu mua lớn</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>

        <!-- Action CTAs: Register Seller & My Listings -->
        <div class="md:col-span-3 flex items-center justify-end gap-1.5">
          <button
            @click="isRegisterModalOpen = true"
            class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer"
            title="Đăng ký điểm bán đồ cũ hoặc pass đồ dọn phòng"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Đăng bán đồ</span>
          </button>

          <button
            @click="isMyListingsModalOpen = true"
            class="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-semibold text-xs transition active:scale-95 cursor-pointer"
            title="Xem các tin đồ cũ của tôi và bấm Đã Bán để ẩn khỏi map"
          >
            <Package class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Tin của tôi</span>
          </button>
        </div>
      </div>

      <!-- Bottom Row: Radius Slider & Summary Counter -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1.5 border-t border-blue-50 text-xs">
        <!-- Radius Slider -->
        <div class="flex items-center gap-2.5 flex-1 max-w-sm">
          <div class="flex items-center gap-1 font-semibold text-slate-600 min-w-max text-[11px] sm:text-xs">
            <SlidersHorizontal class="w-3 h-3 text-blue-600" />
            <span>Quét:</span>
            <span class="px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-bold">
              {{ filters.radiusKm }} km
            </span>
          </div>

          <input
            v-model.number="filters.radiusKm"
            type="range"
            min="1"
            max="20"
            step="1"
            class="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />

          <span class="text-[10px] text-slate-400 font-medium">20km</span>
        </div>

        <!-- Open Now Toggle, 0d Pill & Match Stats -->
        <div class="flex items-center justify-between sm:justify-end gap-2.5 text-xs">
          <!-- 🎁 0đ Free Gift Filter Pill -->
          <button
            type="button"
            @click="filters.priceRange = filters.priceRange === 'free' ? 'all' : 'free'"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition active:scale-95 border cursor-pointer"
            :class="filters.priceRange === 'free'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'"
            title="Chỉ hiện các điểm bán có đồ tặng miễn phí 0đ"
          >
            <Sparkles class="w-3 h-3" />
            <span>🎁 Đồ 0đ</span>
          </button>

          <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
            <input
              v-model="filters.onlyOpenNow"
              type="checkbox"
              class="w-3.5 h-3.5 text-blue-600 rounded border-blue-300 focus:ring-blue-500 cursor-pointer"
            />
            <span class="text-[11px] sm:text-xs font-medium text-slate-700 flex items-center gap-1">
              <Clock class="w-3 h-3 text-blue-600" />
              Đang mở
            </span>
          </label>

          <span class="text-slate-500 text-[11px] sm:text-xs">
            Tìm thấy:
            <strong class="text-blue-700 font-bold">{{ nearbySellers.length }}</strong> điểm bán /
            <strong class="text-slate-800 font-bold">{{ nearbyProducts.length }}</strong> món đồ
          </span>

          <span
            v-if="isCustomLocation"
            class="inline-flex items-center gap-1 px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200/80 rounded text-[10px] font-medium"
          >
            <MapPin class="w-2.5 h-2.5 text-blue-600" />
            Vị trí tự chọn
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
