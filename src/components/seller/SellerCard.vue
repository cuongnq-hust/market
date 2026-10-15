<script setup lang="ts">
import {
  MapPin,
  Clock,
  Phone,
  Package,
  Star,
  CheckCircle,
  User,
  Store,
} from 'lucide-vue-next';
import type { SellerWithDistance } from '../../types/database';
import { formatDistance } from '../../utils/geo';
import { CATEGORIES } from '../../utils/constants';

defineEmits<{
  (e: 'viewInventory', seller: SellerWithDistance): void;
}>();

defineProps<{
  seller: SellerWithDistance;
}>();
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
    <!-- Top Row: Shop Info & Badges -->
    <div>
      <!-- Seller Type Tag -->
      <div class="mb-1.5 flex items-center justify-between">
        <span
          class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="seller.sellerType === 'individual'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-orange-100 text-orange-800'"
        >
          <User v-if="seller.sellerType === 'individual'" class="w-3 h-3 text-purple-600" />
          <Store v-else class="w-3 h-3 text-orange-600" />
          {{ seller.sellerType === 'individual' ? 'Cá nhân pass đồ' : 'Vựa thu mua lớn' }}
        </span>

        <!-- Distance Badge -->
        <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
          📍 {{ formatDistance(seller.distanceKm) }}
        </span>
      </div>

      <div class="flex items-start justify-between gap-2">
        <div class="flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h3 class="text-sm sm:text-base font-bold text-gray-900 group-hover:text-brand-700 transition">
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

          <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <MapPin class="w-3.5 h-3.5 text-gray-400 shrink-0" />
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
            : 'bg-gray-100 text-gray-500'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="seller.isOpenNow ? 'bg-emerald-500' : 'bg-gray-400'"></span>
          {{ seller.isOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa' }}
        </span>

        <span class="text-gray-400 text-[11px] flex items-center gap-1">
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
          class="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium"
        >
          {{ CATEGORIES.find(c => c.key === catKey)?.label || catKey }}
        </span>
      </div>

      <!-- Description snippet -->
      <p class="text-xs text-gray-600 mt-2.5 line-clamp-2 italic bg-gray-50/70 p-2 rounded-xl border border-gray-100">
        "{{ seller.description }}"
      </p>
    </div>

    <!-- Bottom Actions -->
    <div class="pt-2.5 border-t border-gray-100 flex items-center gap-2">
      <a
        :href="`tel:${seller.phone}`"
        class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition active:scale-95"
      >
        <Phone class="w-3.5 h-3.5 text-brand-600" />
        <span>Gọi ngay</span>
      </a>

      <button
        type="button"
        @click="$emit('viewInventory', seller)"
        class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95"
        :class="seller.sellerType === 'individual'
          ? 'bg-purple-600 hover:bg-purple-700'
          : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'"
      >
        <Package class="w-3.5 h-3.5" />
        <span>Kho hàng ({{ seller.productsCount || 0 }})</span>
      </button>
    </div>
  </div>
</template>
