<script setup lang="ts">
import { ref } from 'vue';
import {
  MapPin,
  Clock,
  Phone,
  Package,
  Star,
  CheckCircle,
  User,
  Store,
  Share2,
  Check,
} from 'lucide-vue-next';
import type { SellerWithDistance } from '../../types/database';
import { formatDistance } from '../../utils/geo';
import { CATEGORIES } from '../../utils/constants';
import { shareItem, getSellerShareUrl } from '../../utils/share';

defineEmits<{
  (e: 'viewInventory', seller: SellerWithDistance): void;
}>();

const props = defineProps<{
  seller: SellerWithDistance;
}>();

const isCopied = ref(false);

const handleShare = async () => {
  const url = getSellerShareUrl(props.seller.userId);
  await shareItem({
    title: props.seller.shopName,
    text: `[Pass Đồ Gần Nhà] Xem kho đồ thanh lý của ${props.seller.shopName} tại ${props.seller.address}`,
    url,
  });
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2500);
};
</script>

<template>
  <div class="bg-white/95 rounded-2xl border border-blue-100/80 hover:border-blue-300 p-4 sm:p-5 shadow-[0_2px_10px_rgba(37,99,235,0.04)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.09)] transition-all duration-200 flex flex-col justify-between gap-3 group">
    <!-- Top Row: Shop Info & Badges -->
    <div>
      <!-- Seller Type Tag -->
      <div class="mb-1.5 flex items-center justify-between">
        <span
          class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="seller.sellerType === 'individual'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800'"
        >
          <User v-if="seller.sellerType === 'individual'" class="w-3 h-3 text-purple-600" />
          <Store v-else class="w-3 h-3 text-blue-600" />
          {{ seller.sellerType === 'individual' ? 'Cá nhân pass đồ' : 'Vựa thu mua lớn' }}
        </span>

        <!-- Distance Badge & Share Button -->
        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0">
            📍 {{ formatDistance(seller.distanceKm) }}
          </span>

          <button
            type="button"
            @click.stop="handleShare"
            class="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition active:scale-90 cursor-pointer"
            :title="isCopied ? 'Đã sao chép link!' : 'Chia sẻ điểm bán này'"
          >
            <Check v-if="isCopied" class="w-3.5 h-3.5 text-emerald-600" />
            <Share2 v-else class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div class="flex items-start justify-between gap-2">
        <div class="flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h3 class="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
              {{ seller.shopName }}
            </h3>
            <span
              v-if="seller.isVerified"
              class="inline-flex items-center text-blue-600"
              title="Điểm thu mua uy tín đã xác thực"
            >
              <CheckCircle class="w-4 h-4 fill-blue-50" />
            </span>
          </div>

          <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin class="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span class="line-clamp-1">{{ seller.address }}</span>
          </p>
        </div>
      </div>

      <!-- Categories & Operating Hours -->
      <div class="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
        <!-- Open status -->
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px]"
          :class="seller.isOpenNow 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-100 text-slate-500'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="seller.isOpenNow ? 'bg-emerald-500' : 'bg-slate-400'"></span>
          {{ seller.isOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa' }}
        </span>

        <span class="text-slate-400 text-[11px] flex items-center gap-1">
          <Clock class="w-3 h-3" />
          {{ seller.openTime }} - {{ seller.closeTime }}
        </span>

        <span v-if="seller.rating" class="inline-flex items-center gap-0.5 text-amber-600 font-semibold text-[11px]">
          <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
          {{ seller.rating }}
        </span>
      </div>

      <!-- Categories Badges -->
      <div class="mt-2.5 flex flex-wrap gap-1">
        <span
          v-for="catKey in seller.categories"
          :key="catKey"
          class="text-[10px] px-2 py-0.5 rounded-md bg-blue-50/60 text-blue-800 border border-blue-100/60 font-medium"
        >
          {{ CATEGORIES.find(c => c.key === catKey)?.label || catKey }}
        </span>
      </div>

      <!-- Description snippet -->
      <p class="text-xs text-slate-600 mt-2.5 line-clamp-2 italic bg-blue-50/30 p-2 rounded-xl border border-blue-100/60">
        "{{ seller.description }}"
      </p>
    </div>

    <!-- Bottom Actions -->
    <div class="pt-2.5 border-t border-blue-50 flex items-center gap-2">
      <a
        :href="`tel:${seller.phone}`"
        class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl border border-blue-200/80 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold transition active:scale-95 shadow-2xs"
      >
        <Phone class="w-3.5 h-3.5 text-blue-600" />
        <span>Gọi ngay</span>
      </a>

      <button
        type="button"
        @click="$emit('viewInventory', seller)"
        class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
        :class="seller.sellerType === 'individual'
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'"
      >
        <Package class="w-3.5 h-3.5" />
        <span>Kho hàng ({{ seller.productsCount || 0 }})</span>
      </button>
    </div>
  </div>
</template>
