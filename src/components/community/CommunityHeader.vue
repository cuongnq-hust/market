<script setup lang="ts">
import { Plus, MessageSquareQuote } from 'lucide-vue-next';
import { useForum } from '../../composables/useForum';
import type { ForumPostType } from '../../types/database';

const { forumFilters, setPostType, isCreateModalOpen, posts } = useForum();

const selectTab = (type: ForumPostType) => {
  setPostType(type);
};
</script>

<template>
  <div class="bg-white/90 backdrop-blur-md border-b border-blue-100/80">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-0">
      <!-- Title & CTA Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <MessageSquareQuote class="w-5 h-5" />
            </span>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Diễn Đàn Cộng Đồng 2 Chiều
            </h1>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 pl-11">
            Kết nối trực tiếp giữa người thanh lý dọn nhà và người thu mua qua Điện thoại & Zalo
          </p>
        </div>

        <!-- Create Post CTA Button -->
        <button
          @click="isCreateModalOpen = true"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>Đăng tin mới</span>
        </button>
      </div>

      <!-- 2 Tabs Navigation -->
      <div class="flex border-b border-blue-100 -mb-px">
        <!-- Tab 1: Cần Bán / Thanh Lý Gấp -->
        <button
          @click="selectTab('sell')"
          class="flex-1 py-3.5 px-2 sm:px-4 text-center border-b-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
          :class="forumFilters.postType === 'sell'
            ? 'border-blue-600 text-blue-700 bg-blue-50/60'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
        >
          <span class="text-base sm:text-lg">⚡</span>
          <span>Cần Bán / Thanh Lý Gấp</span>
          <span
            v-if="forumFilters.postType === 'sell'"
            class="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold hidden sm:inline"
          >
            {{ posts.length }} tin
          </span>
        </button>

        <!-- Tab 2: Tìm Mua / Gom Hàng -->
        <button
          @click="selectTab('buy')"
          class="flex-1 py-3.5 px-2 sm:px-4 text-center border-b-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
          :class="forumFilters.postType === 'buy'
            ? 'border-sky-600 text-sky-800 bg-sky-50/60'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
        >
          <span class="text-base sm:text-lg">🔍</span>
          <span>Tìm Mua / Gom Hàng</span>
          <span
            v-if="forumFilters.postType === 'buy'"
            class="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold hidden sm:inline"
          >
            {{ posts.length }} tin
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
