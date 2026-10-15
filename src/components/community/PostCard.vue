<script setup lang="ts">
import { ref } from 'vue';
import {
  Phone,
  MessageSquare,
  MapPin,
  Tag,
  Zap,
  Share2,
} from 'lucide-vue-next';
import type { ForumPost } from '../../types/database';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';

defineProps<{
  post: ForumPost;
}>();

const copiedLink = ref(false);

const getCategoryLabel = (catKey: string) => {
  return CATEGORIES.find((c) => c.key === catKey)?.label || catKey;
};

const copyShareLink = () => {
  try {
    navigator.clipboard.writeText(window.location.href);
    copiedLink.value = true;
    setTimeout(() => {
      copiedLink.value = false;
    }, 2000);
  } catch {
    // fallback
  }
};
</script>

<template>
  <article class="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
    <!-- Post Header: Author Info & Badges -->
    <div class="p-4 sm:p-5 pb-3">
      <div class="flex items-start justify-between gap-3">
        <!-- Author Profile -->
        <div class="flex items-center gap-3">
          <img
            :src="post.author.avatar"
            :alt="post.author.name"
            class="w-11 h-11 rounded-full object-cover border-2 border-orange-100 shadow-xs shrink-0"
            loading="lazy"
          />

          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <h3 class="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                {{ post.author.name }}
              </h3>
              <span
                v-if="post.author.role === 'seller'"
                class="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-800 font-semibold"
              >
                Chủ kho/Vựa
              </span>
            </div>

            <div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span class="flex items-center gap-0.5 text-gray-600 font-medium">
                <MapPin class="w-3.5 h-3.5 text-orange-600" />
                {{ post.district }}, {{ post.city }}
              </span>
              <span>•</span>
              <span class="text-gray-400">{{ formatRelativeTime(post.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Badges (Post Type & Urgent) -->
        <div class="flex items-center gap-1.5 flex-wrap justify-end">
          <!-- Urgent Badge -->
          <span
            v-if="post.isUrgent"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-700 animate-pulse border border-red-200 shadow-xs"
          >
            <Zap class="w-3 h-3 fill-red-600" />
            GẤP 24H
          </span>

          <!-- Post Type Badge -->
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs"
            :class="post.type === 'sell'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'"
          >
            {{ post.type === 'sell' ? '⚡ Cần Bán' : '🔍 Cần Mua' }}
          </span>
        </div>
      </div>

      <!-- Post Title & Content -->
      <div class="mt-3.5 space-y-2">
        <h2 class="text-base sm:text-lg font-bold text-gray-900 leading-snug">
          {{ post.title }}
        </h2>

        <p class="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {{ post.content }}
        </p>
      </div>

      <!-- Category & Price Bar -->
      <div class="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <!-- Category Tag -->
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
          <Tag class="w-3 h-3 text-gray-500" />
          {{ getCategoryLabel(post.category) }}
        </span>

        <!-- Expected Price Tag -->
        <div class="flex items-center gap-1.5">
          <span class="text-gray-500 text-[11px]">Mức giá:</span>
          <span
            class="text-sm font-extrabold px-2.5 py-0.5 rounded-lg"
            :class="post.price === 'free'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : post.price === 'negotiable'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-orange-50 text-orange-700 border border-orange-200'"
          >
            {{ formatPrice(post.price) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Image Gallery (if any) -->
    <div v-if="post.images && post.images.length > 0" class="px-4 sm:px-5 pb-3">
      <!-- Single Image -->
      <div
        v-if="post.images.length === 1"
        class="rounded-xl overflow-hidden aspect-video max-h-72 w-full bg-gray-100 border border-gray-200"
      >
        <img
          :src="post.images[0]"
          :alt="post.title"
          class="w-full h-full object-cover hover:scale-102 transition duration-300"
          loading="lazy"
        />
      </div>

      <!-- Multiple Images Grid -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 gap-2"
      >
        <div
          v-for="(img, idx) in post.images.slice(0, 3)"
          :key="idx"
          class="rounded-xl overflow-hidden aspect-square bg-gray-100 border border-gray-200 relative group cursor-pointer"
        >
          <img
            :src="img"
            :alt="post.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <!-- Direct Contact Actions Bar (Tối giản: Gọi điện & Nhắn Zalo) -->
    <div class="p-4 sm:px-5 py-3 bg-gradient-to-r from-gray-50 to-orange-50/40 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="text-xs text-gray-500">
        Liên hệ người đăng: <strong class="text-gray-800">{{ post.author.name }}</strong>
      </div>

      <div class="flex items-center gap-2">
        <!-- Direct Phone Call -->
        <a
          v-if="post.author.phone"
          :href="`tel:${post.author.phone}`"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
        >
          <Phone class="w-3.5 h-3.5" />
          <span>Gọi: {{ post.author.phone }}</span>
        </a>

        <!-- Direct Zalo Chat -->
        <a
          v-if="post.author.zalo"
          :href="`https://zalo.me/${post.author.zalo}`"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
        >
          <MessageSquare class="w-3.5 h-3.5" />
          <span>Nhắn Zalo</span>
        </a>

        <!-- Share Button -->
        <button
          @click="copyShareLink"
          class="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-500 transition shrink-0"
          title="Sao chép liên kết chia sẻ"
        >
          <Share2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </article>
</template>
