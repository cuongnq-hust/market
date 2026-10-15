<script setup lang="ts">
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Star,
  CheckCircle,
  Package,
  User,
  Store,
  CheckCheck,
} from 'lucide-vue-next';
import type { Product, SellerWithDistance } from '../../types/database';
import { formatDistance } from '../../utils/geo';
import { formatPrice, formatCondition } from '../../utils/formatters';
import { useNearbyFilter } from '../../composables/useNearbyFilter';

defineProps<{
  seller: SellerWithDistance;
  products: Product[];
  isLoading: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { markProductAsSold } = useNearbyFilter();

const handleMarkSold = async (item: Product) => {
  await markProductAsSold(item.id);
};
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
    <div class="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-orange-50 via-amber-50 to-white px-6 py-5 border-b border-orange-100 relative">
        <button
          @click="$emit('close')"
          class="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center shadow-xs transition active:scale-90"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="flex items-start gap-3">
          <div
            class="w-12 h-12 rounded-2xl text-white flex items-center justify-center text-xl shadow-md shrink-0"
            :class="seller.sellerType === 'individual' ? 'bg-purple-600 shadow-purple-500/20' : 'bg-orange-500 shadow-orange-500/20'"
          >
            <User v-if="seller.sellerType === 'individual'" class="w-6 h-6 text-white" />
            <span v-else>🏪</span>
          </div>

          <div class="flex-1 pr-8">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-xl font-bold text-gray-900">{{ seller.shopName }}</h2>
              
              <!-- Seller Type Badge -->
              <span
                class="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-2xs"
                :class="seller.sellerType === 'individual'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-orange-100 text-orange-800 border border-orange-200'"
              >
                <User v-if="seller.sellerType === 'individual'" class="w-3 h-3 text-purple-600" />
                <Store v-else class="w-3 h-3 text-orange-600" />
                {{ seller.sellerType === 'individual' ? 'Người bán đơn lẻ (Cá nhân pass đồ)' : 'Vựa thu mua / Cửa hàng' }}
              </span>

              <span
                v-if="seller.isVerified"
                class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold"
              >
                <CheckCircle class="w-3.5 h-3.5" />
                Đã xác thực
              </span>
            </div>

            <p class="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1.5">
              <MapPin class="w-4 h-4 text-orange-500 shrink-0" />
              <span>{{ seller.address }}</span>
              <span class="font-bold text-brand-700 ml-1">(Cách bạn {{ formatDistance(seller.distanceKm) }})</span>
            </p>
          </div>
        </div>

        <!-- Contact & Hours Actions Row -->
        <div class="mt-4 pt-3 border-t border-orange-100/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-4 text-gray-600">
            <span class="flex items-center gap-1.5 font-medium">
              <Clock class="w-4 h-4 text-gray-400" />
              {{ seller.openTime }} - {{ seller.closeTime }}
              <span
                class="ml-1 text-[11px] px-1.5 py-0.2 rounded font-bold"
                :class="seller.isOpenNow ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'"
              >
                {{ seller.isOpenNow ? 'Đang mở' : 'Đã đóng' }}
              </span>
            </span>

            <span v-if="seller.rating" class="flex items-center gap-1 text-amber-600 font-bold">
              <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
              {{ seller.rating }} / 5.0
            </span>
          </div>

          <!-- Quick Contact Buttons -->
          <div class="flex items-center gap-2">
            <a
              v-if="seller.phone"
              :href="`tel:${seller.phone}`"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition active:scale-95"
            >
              <Phone class="w-4 h-4" />
              <span>Gọi: {{ seller.phone }}</span>
            </a>

            <a
              v-if="seller.zalo"
              :href="`https://zalo.me/${seller.zalo}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition active:scale-95"
            >
              <MessageCircle class="w-4 h-4" />
              <span>Nhắn Zalo</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Inventory Section (Scrollable Body) -->
      <div class="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-900 text-base flex items-center gap-2">
            <Package class="w-5 h-5 text-orange-500" />
            <span>Kho hàng đang thanh lý</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold">
              {{ products.length }} món
            </span>
          </h3>

          <span v-if="seller.sellerType === 'individual'" class="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
            💡 Bán xong bấm "Đã bán" để tự động ẩn khỏi bản đồ
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="py-16 text-center text-gray-500">
          <div class="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-xs">Đang kiểm tra kho hàng...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="products.length === 0" class="py-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
          <Package class="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p class="font-medium text-gray-700">Điểm bán này hiện không có sản phẩm nào khả dụng</p>
        </div>

        <!-- Products Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in products"
            :key="item.id"
            class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            :class="{ 'opacity-70': item.status === 'sold' }"
          >
            <!-- Product Image -->
            <div class="relative aspect-video w-full overflow-hidden bg-gray-100">
              <img
                :src="item.images[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />

              <!-- Condition Badge -->
              <div class="absolute top-2 left-2">
                <span
                  class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md shadow-xs"
                  :class="formatCondition(item.condition).badgeClass"
                >
                  {{ formatCondition(item.condition).label }}
                </span>
              </div>

              <!-- Status Overlay if Sold -->
              <div v-if="item.status === 'sold'" class="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <span class="text-white text-xs font-bold uppercase tracking-wider bg-gray-700/90 px-3 py-1 rounded-full border border-gray-500">
                  ĐÃ BÁN (Đã ẩn)
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 class="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-orange-600 transition" :class="{ 'line-through text-gray-400': item.status === 'sold' }">
                  {{ item.title }}
                </h4>
                <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                  {{ item.description }}
                </p>
              </div>

              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span class="text-[11px] text-gray-400 block">Giá thanh lý:</span>
                  <span
                    class="text-sm font-extrabold"
                    :class="item.price === 'free' 
                      ? 'text-emerald-600' 
                      : item.price === 'negotiable' 
                        ? 'text-blue-600' 
                        : 'text-orange-600'"
                  >
                    {{ formatPrice(item.price) }}
                  </span>
                </div>

                <!-- Action Button -->
                <div class="flex items-center gap-1.5">
                  <!-- Button for seller to mark as sold -->
                  <button
                    v-if="item.status === 'available'"
                    @click="handleMarkSold(item)"
                    class="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition"
                    title="Đánh dấu đã bán để ẩn khỏi bản đồ"
                  >
                    <CheckCheck class="w-3.5 h-3.5 inline mr-0.5" />
                    Đã bán
                  </button>

                  <a
                    v-if="item.status === 'available'"
                    :href="`tel:${seller.phone}`"
                    class="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-700 text-xs font-medium transition"
                  >
                    Hỏi mua
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3.5 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>Ghi chú: Đối với người bán cá nhân, sau khi tất cả món đồ được đánh dấu Đã Bán thì vị trí sẽ tự động ẩn khỏi bản đồ.</span>
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition active:scale-95"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>
