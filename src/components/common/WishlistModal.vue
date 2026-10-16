<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  X,
  Heart,
  Trash2,
  ExternalLink,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
} from 'lucide-vue-next';
import { useFavorites } from '../../composables/useFavorites';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';
import type { FavoriteItem } from '../../types/database';
import { generateContactMessage, openZaloWithTemplate } from '../../utils/share';

const router = useRouter();
const { favorites, isWishlistModalOpen, removeFavorite, clearFavorites } = useFavorites();

const filterType = ref<'all' | 'post' | 'product'>('all');
const toastMessage = ref<string | null>(null);

const showToast = (msg: string) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = null;
  }, 3500);
};

const filteredFavorites = computed(() => {
  if (filterType.value === 'all') return favorites.value;
  return favorites.value.filter((f) => f.type === filterType.value);
});

const handleNavigate = (item: FavoriteItem) => {
  isWishlistModalOpen.value = false;
  if (item.targetUrl) {
    router.push(item.targetUrl);
  } else if (item.type === 'post') {
    router.push(`/community?post=${item.id}`);
  }
};

const handleContactZalo = async (item: FavoriteItem) => {
  const phone = item.zalo || item.phone;
  if (!phone) {
    showToast('Người bán chưa cung cấp số Zalo');
    return;
  }
  const msg = generateContactMessage(item.title, formatPrice(item.price));
  const res = await openZaloWithTemplate(phone, msg);
  showToast(res.message);
};
</script>

<template>
  <div
    v-if="isWishlistModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
  >
    <div
      class="relative bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100"
    >
      <!-- Toast Notification -->
      <div
        v-if="toastMessage"
        class="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-md pointer-events-none animate-fade-in"
      >
        <span>{{ toastMessage }}</span>
      </div>

      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-rose-50 via-pink-50 to-white px-6 py-5 border-b border-rose-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <Heart class="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
              <span>Món Đồ Đã Lưu</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold">
                {{ favorites.length }}
              </span>
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">
              Lưu giữ trên máy của bạn, không cần tài khoản đăng nhập
            </p>
          </div>
        </div>

        <button
          @click="isWishlistModalOpen = false"
          class="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center shadow-xs transition active:scale-90"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Filter Tabs & Actions -->
      <div
        v-if="favorites.length > 0"
        class="px-6 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between gap-2 text-xs"
      >
        <div class="flex items-center gap-1.5">
          <button
            @click="filterType = 'all'"
            class="px-2.5 py-1 rounded-lg font-semibold transition"
            :class="filterType === 'all' ? 'bg-white text-rose-700 shadow-2xs border border-rose-200' : 'text-gray-500 hover:text-gray-800'"
          >
            Tất cả ({{ favorites.length }})
          </button>
          <button
            @click="filterType = 'post'"
            class="px-2.5 py-1 rounded-lg font-semibold transition"
            :class="filterType === 'post' ? 'bg-white text-rose-700 shadow-2xs border border-rose-200' : 'text-gray-500 hover:text-gray-800'"
          >
            Diễn đàn
          </button>
          <button
            @click="filterType = 'product'"
            class="px-2.5 py-1 rounded-lg font-semibold transition"
            :class="filterType === 'product' ? 'bg-white text-rose-700 shadow-2xs border border-rose-200' : 'text-gray-500 hover:text-gray-800'"
          >
            Kho hàng shop
          </button>
        </div>

        <button
          @click="clearFavorites"
          class="text-gray-400 hover:text-red-600 transition inline-flex items-center gap-1 text-[11px]"
          title="Xóa tất cả mục đã lưu"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Xóa hết</span>
        </button>
      </div>

      <!-- Body / Items List -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-gray-50/40">
        <!-- Empty State -->
        <div
          v-if="filteredFavorites.length === 0"
          class="py-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-200/80 p-6"
        >
          <div class="w-14 h-14 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <Heart class="w-7 h-7" />
          </div>
          <h3 class="font-bold text-gray-800 text-sm">Chưa có món đồ nào được lưu</h3>
          <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Khi lướt diễn đàn hoặc xem bản đồ, bạn có thể bấm biểu tượng ❤️ để lưu lại các món đồ đang phân vân và liên hệ sau!
          </p>
        </div>

        <!-- Cards List -->
        <div
          v-for="item in filteredFavorites"
          :key="item.id"
          class="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition flex items-center gap-3.5 group"
        >
          <!-- Thumbnail Image -->
          <div
            @click="handleNavigate(item)"
            class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer relative"
          >
            <img
              :src="item.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80'"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span
              v-if="item.price === 'free'"
              class="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-white shadow-xs"
            >
              🎁 0đ
            </span>
          </div>

          <!-- Content Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h4
                @click="handleNavigate(item)"
                class="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 cursor-pointer hover:text-brand-600 transition"
              >
                {{ item.title }}
              </h4>

              <button
                @click="removeFavorite(item.id)"
                class="text-gray-300 hover:text-rose-500 transition p-1 rounded-lg shrink-0"
                title="Bỏ lưu món này"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="flex items-center gap-2 mt-1">
              <span
                class="text-xs sm:text-sm font-extrabold"
                :class="item.price === 'free' ? 'text-emerald-600' : item.price === 'negotiable' ? 'text-blue-600' : 'text-orange-600'"
              >
                {{ formatPrice(item.price) }}
              </span>

              <span class="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium">
                {{ item.type === 'post' ? 'Diễn đàn' : 'Kho hàng' }}
              </span>
            </div>

            <p v-if="item.authorOrShopName || item.location" class="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 line-clamp-1">
              <MapPin v-if="item.location" class="w-3 h-3 text-gray-400 shrink-0" />
              <span>{{ item.authorOrShopName }} {{ item.location ? `• ${item.location}` : '' }}</span>
            </p>

            <!-- Bottom Actions -->
            <div class="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
              <span class="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock class="w-3 h-3" />
                {{ formatRelativeTime(item.savedAt) }}
              </span>

              <div class="flex items-center gap-1.5">
                <button
                  v-if="item.zalo || item.phone"
                  @click="handleContactZalo(item)"
                  class="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition active:scale-95 flex items-center gap-1"
                >
                  <MessageSquare class="w-3 h-3 text-blue-600" />
                  <span>Zalo</span>
                </button>

                <a
                  v-if="item.phone"
                  :href="`tel:${item.phone}`"
                  class="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 transition active:scale-95 flex items-center gap-1"
                >
                  <Phone class="w-3 h-3 text-emerald-600" />
                  <span>Gọi</span>
                </a>

                <button
                  @click="handleNavigate(item)"
                  class="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold transition active:scale-95 flex items-center gap-1"
                >
                  <ExternalLink class="w-3 h-3" />
                  <span>Xem</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>💡 Các món đồ được lưu trong bộ nhớ trình duyệt của thiết bị này.</span>
        <button
          @click="isWishlistModalOpen = false"
          class="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>
