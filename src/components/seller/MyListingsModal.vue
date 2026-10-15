<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  X,
  CheckCircle,
  RotateCcw,
  Package,
  EyeOff,
  Eye,
  Plus,
} from 'lucide-vue-next';
import { useNearbyFilter } from '../../composables/useNearbyFilter';
import { dataService } from '../../services';
import type { Product } from '../../types/database';
import { formatPrice } from '../../utils/formatters';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { markProductAsSold, markProductAsAvailable, isRegisterModalOpen } = useNearbyFilter();

const myProducts = ref<Product[]>([]);
const isLoading = ref(false);
const toastMessage = ref<string | null>(null);

const showToast = (msg: string) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = null;
  }, 3500);
};

const loadMyProducts = async () => {
  isLoading.value = true;
  try {
    const items = await dataService.getMyProducts();
    myProducts.value = items;
  } finally {
    isLoading.value = false;
  }
};

const handleSold = async (product: Product) => {
  await markProductAsSold(product.id);
  product.status = 'sold';
  showToast(`✅ Đã cập nhật "${product.title}" thành ĐÃ BÁN. Món đồ đã được ẩn khỏi bản đồ!`);
};

const handleReopen = async (product: Product) => {
  await markProductAsAvailable(product.id);
  product.status = 'available';
  showToast(`🎉 Đã mở bán lại "${product.title}". Món đồ đã xuất hiện lại trên bản đồ!`);
};

const openRegisterModal = () => {
  emit('close');
  isRegisterModalOpen.value = true;
};

onMounted(() => {
  loadMyProducts();
});
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
    <div class="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
      <!-- Toast Alert Banner -->
      <div
        v-if="toastMessage"
        class="bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between animate-fade-in shadow-md"
      >
        <span>{{ toastMessage }}</span>
        <button @click="toastMessage = null" class="text-white/80 hover:text-white">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
        <div>
          <h2 class="text-lg font-black text-gray-900 leading-tight flex items-center gap-2">
            <span>📦 Quản Lý Tin Đăng Của Người Bán</span>
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            Người bán đơn lẻ sau khi bán xong bấm "Đã bán" để hệ thống tự động ẩn khỏi bản đồ
          </p>
        </div>

        <button
          @click="$emit('close')"
          class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition active:scale-90"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content Body -->
      <div class="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
        <!-- Loading -->
        <div v-if="isLoading" class="py-12 text-center text-gray-400">
          Đang tải danh sách đồ thanh lý...
        </div>

        <!-- Empty state -->
        <div v-else-if="myProducts.length === 0" class="py-12 text-center bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-3">
          <Package class="w-12 h-12 text-gray-300 mx-auto" />
          <h3 class="font-bold text-gray-800 text-sm">Bạn chưa có món đồ thanh lý nào</h3>
          <p class="text-xs text-gray-500 max-w-sm mx-auto">
            Hãy đăng ký một điểm bán cá nhân hoặc đăng món đồ cũ cần pass dọn nhà để người gần bạn tìm thấy!
          </p>
          <button
            @click="openRegisterModal"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Plus class="w-4 h-4" />
            <span>Đăng món đồ đầu tiên</span>
          </button>
        </div>

        <!-- Products List -->
        <div v-else class="space-y-3">
          <div
            v-for="item in myProducts"
            :key="item.id"
            class="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            :class="item.status === 'sold'
              ? 'bg-gray-50 border-gray-200 opacity-75'
              : 'bg-white border-brand-200 shadow-xs hover:border-brand-300'"
          >
            <!-- Product Info -->
            <div class="flex items-start gap-3">
              <img
                :src="item.images[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=200&q=80'"
                :alt="item.title"
                class="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
              />

              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-bold text-gray-900 text-sm" :class="{ 'line-through text-gray-500': item.status === 'sold' }">
                    {{ item.title }}
                  </h4>

                  <!-- Status Badge -->
                  <span
                    class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                    :class="item.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-gray-200 text-gray-700'"
                  >
                    <Eye v-if="item.status === 'available'" class="w-3 h-3 text-emerald-600" />
                    <EyeOff v-else class="w-3 h-3 text-gray-500" />
                    {{ item.status === 'available' ? 'Đang hiện trên bản đồ' : 'ĐÃ BÁN (Đã ẩn khỏi map)' }}
                  </span>
                </div>

                <div class="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  <span class="font-extrabold text-orange-600">{{ formatPrice(item.price) }}</span>
                  <span>•</span>
                  <span>Mã tin: {{ item.id }}</span>
                </div>
              </div>
            </div>

            <!-- Action Button: Mark Sold vs Reopen -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- If available, button to mark as SOLD -->
              <button
                v-if="item.status === 'available'"
                @click="handleSold(item)"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition active:scale-95"
                title="Bấm vào đây khi bạn đã thanh lý xong món đồ này"
              >
                <CheckCircle class="w-4 h-4" />
                <span>Đã bán xong (Ẩn khỏi bản đồ)</span>
              </button>

              <!-- If sold, button to reopen -->
              <button
                v-else
                @click="handleReopen(item)"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition active:scale-95"
                title="Mở bán lại và hiển thị lên bản đồ"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Mở bán lại</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
        <span>Ghi chú: Người bán đơn lẻ sau khi bán hết các món đồ thì điểm ghim của mình sẽ hoàn toàn biến mất trên bản đồ.</span>
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition active:scale-95"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>
