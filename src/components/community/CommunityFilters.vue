<script setup lang="ts">
import { Search, MapPin, Layers, X, RotateCcw, Tag, ArrowUpDown, Sparkles, Zap } from 'lucide-vue-next';
import { useForum } from '../../composables/useForum';
import { CATEGORIES, HANOI_DISTRICTS, PRICE_RANGE_OPTIONS, SORT_OPTIONS } from '../../utils/constants';

const { forumFilters, posts } = useForum();

const clearSearch = () => {
  forumFilters.searchQuery = '';
};

const toggleFreeOnly = () => {
  if (forumFilters.priceRange === 'free') {
    forumFilters.priceRange = 'all';
  } else {
    forumFilters.priceRange = 'free';
  }
};

const toggleUrgentOnly = () => {
  if (forumFilters.sortBy === 'urgent') {
    forumFilters.sortBy = 'newest';
  } else {
    forumFilters.sortBy = 'urgent';
  }
};

const resetAllFilters = () => {
  forumFilters.searchQuery = '';
  forumFilters.district = 'all';
  forumFilters.category = 'all';
  forumFilters.priceRange = 'all';
  forumFilters.sortBy = 'newest';
};

const hasActiveFilter = () => {
  return (
    forumFilters.searchQuery !== '' ||
    forumFilters.district !== 'all' ||
    forumFilters.category !== 'all' ||
    (forumFilters.priceRange && forumFilters.priceRange !== 'all') ||
    (forumFilters.sortBy && forumFilters.sortBy !== 'newest')
  );
};
</script>

<template>
  <div class="bg-white/90 backdrop-blur-md border-b border-blue-100/80 py-3.5 px-4 sm:px-6 shadow-[0_2px_10px_rgba(37,99,235,0.03)]">
    <div class="max-w-4xl mx-auto flex flex-col gap-3">
      <!-- Row 1: Search & Dropdowns -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <!-- Search Input -->
        <div class="relative sm:col-span-4">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search class="h-4 w-4" />
          </div>
          <input
            v-model="forumFilters.searchQuery"
            type="text"
            placeholder="Tìm theo từ khóa, đồ cũ..."
            class="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-blue-100 rounded-xl bg-blue-50/30 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none"
          />
          <button
            v-if="forumFilters.searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- District Selector -->
        <div class="relative sm:col-span-3">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin class="h-4 w-4" />
          </div>
          <select
            v-model="forumFilters.district"
            class="block w-full pl-9 pr-7 py-2 text-xs sm:text-sm border border-blue-100 rounded-xl bg-blue-50/30 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none appearance-none cursor-pointer"
          >
            <option value="all">📍 Toàn Hà Nội</option>
            <option v-for="d in HANOI_DISTRICTS" :key="d" :value="d">
              {{ d }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>

        <!-- Category Selector -->
        <div class="relative sm:col-span-3">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Layers class="h-4 w-4" />
          </div>
          <select
            v-model="forumFilters.category"
            class="block w-full pl-9 pr-7 py-2 text-xs sm:text-sm border border-blue-100 rounded-xl bg-blue-50/30 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none appearance-none cursor-pointer"
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

        <!-- Price Range Selector -->
        <div class="relative sm:col-span-2">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Tag class="h-3.5 w-3.5" />
          </div>
          <select
            v-model="forumFilters.priceRange"
            class="block w-full pl-8 pr-6 py-2 text-xs sm:text-sm border border-blue-100 rounded-xl bg-blue-50/30 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none appearance-none cursor-pointer"
          >
            <option v-for="opt in PRICE_RANGE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Row 2: Quick Filter Pills & Sorting Dropdown -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-50">
        <!-- Quick Pills -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[11px] font-bold text-slate-500 mr-1">Lọc nhanh:</span>

          <!-- 🎁 0đ Pill -->
          <button
            type="button"
            @click="toggleFreeOnly"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition active:scale-95 border cursor-pointer"
            :class="forumFilters.priceRange === 'free'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>🎁 Đồ tặng 0đ</span>
          </button>

          <!-- ⚡ Cần bán gấp Pill -->
          <button
            type="button"
            @click="toggleUrgentOnly"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition active:scale-95 border cursor-pointer"
            :class="forumFilters.sortBy === 'urgent'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'"
          >
            <Zap class="w-3.5 h-3.5" />
            <span>⚡ Cần bán gấp</span>
          </button>

          <!-- Under 100k Pill -->
          <button
            type="button"
            @click="forumFilters.priceRange = forumFilters.priceRange === 'under_100k' ? 'all' : 'under_100k'"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition active:scale-95 border cursor-pointer"
            :class="forumFilters.priceRange === 'under_100k'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'"
          >
            <span>Dưới 100k</span>
          </button>
        </div>

        <!-- Sort Select -->
        <div class="flex items-center gap-1.5">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown class="h-3 w-3" />
            </div>
            <select
              v-model="forumFilters.sortBy"
              class="pl-7 pr-6 py-1 text-xs font-medium border border-blue-100 rounded-lg bg-blue-50/40 hover:bg-white focus:bg-white outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option v-for="s in SORT_OPTIONS" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-1.5 pointer-events-none text-slate-400">
              <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: Status & Reset -->
      <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Đang hiển thị: <strong class="text-blue-700 font-bold">{{ posts.length }}</strong> bài viết
        </span>

        <button
          v-if="hasActiveFilter()"
          @click="resetAllFilters"
          class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    </div>
  </div>
</template>
