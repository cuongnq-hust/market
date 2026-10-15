<script setup lang="ts">
import { Search, MapPin, Layers, X, RotateCcw } from 'lucide-vue-next';
import { useForum } from '../../composables/useForum';
import { CATEGORIES, HANOI_DISTRICTS } from '../../utils/constants';

const { forumFilters, posts } = useForum();

const clearSearch = () => {
  forumFilters.searchQuery = '';
};

const resetAllFilters = () => {
  forumFilters.searchQuery = '';
  forumFilters.district = 'all';
  forumFilters.category = 'all';
};

const hasActiveFilter = () => {
  return (
    forumFilters.searchQuery !== '' ||
    forumFilters.district !== 'all' ||
    forumFilters.category !== 'all'
  );
};
</script>

<template>
  <div class="bg-white border-b border-gray-200 py-3.5 px-4 sm:px-6 shadow-xs">
    <div class="max-w-4xl mx-auto flex flex-col gap-3">
      <!-- Row 1: Search & Dropdowns -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <!-- Search Input -->
        <div class="relative sm:col-span-6">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search class="h-4 w-4" />
          </div>
          <input
            v-model="forumFilters.searchQuery"
            type="text"
            placeholder="Tìm theo từ khóa, tên đồ cũ, người đăng..."
            class="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50/70 hover:bg-white focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition outline-none"
          />
          <button
            v-if="forumFilters.searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- District Selector -->
        <div class="relative sm:col-span-3">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <MapPin class="h-4 w-4" />
          </div>
          <select
            v-model="forumFilters.district"
            class="block w-full pl-9 pr-7 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50/70 hover:bg-white focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition outline-none appearance-none"
          >
            <option value="all">📍 Toàn bộ Hà Nội</option>
            <option v-for="d in HANOI_DISTRICTS" :key="d" :value="d">
              {{ d }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>

        <!-- Category Selector -->
        <div class="relative sm:col-span-3">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Layers class="h-4 w-4" />
          </div>
          <select
            v-model="forumFilters.category"
            class="block w-full pl-9 pr-7 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50/70 hover:bg-white focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition outline-none appearance-none"
          >
            <option value="all">📦 Tất cả danh mục</option>
            <option v-for="cat in CATEGORIES" :key="cat.key" :value="cat.key">
              {{ cat.label }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Row 2: Status & Reset -->
      <div class="flex items-center justify-between text-xs text-gray-500 pt-1">
        <span>
          Đang hiển thị: <strong class="text-gray-900 font-bold">{{ posts.length }}</strong> bài viết
        </span>

        <button
          v-if="hasActiveFilter()"
          @click="resetAllFilters"
          class="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    </div>
  </div>
</template>
