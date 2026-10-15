<script setup lang="ts">
import { useNearbyFilter } from '../composables/useNearbyFilter';
import { useGeolocation } from '../composables/useGeolocation';
import FilterBar from '../components/common/FilterBar.vue';
import LeafletMap from '../components/map/LeafletMap.vue';
import SellerCard from '../components/seller/SellerCard.vue';
import SellerInventoryModal from '../components/seller/SellerInventoryModal.vue';
import RegisterSellerModal from '../components/seller/RegisterSellerModal.vue';
import MyListingsModal from '../components/seller/MyListingsModal.vue';
import { AlertCircle, RotateCcw, PackageSearch } from 'lucide-vue-next';

const {
  viewMode,
  nearbySellers,
  selectedSeller,
  sellerInventory,
  isInventoryLoading,
  isRegisterModalOpen,
  isMyListingsModalOpen,
  openSellerModal,
  closeSellerModal,
  filters,
} = useNearbyFilter();

const { locationError, resetToDefaultCenter } = useGeolocation();

const resetFilters = () => {
  filters.searchQuery = '';
  filters.category = 'all';
  filters.radiusKm = 10;
  filters.onlyOpenNow = false;
  filters.sellerType = 'all';
};
</script>

<template>
  <div class="flex flex-col flex-1 h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-100">
    <!-- Top Filter & Search Toolbar -->
    <FilterBar />

    <!-- GPS Warning Banner if any -->
    <div
      v-if="locationError"
      class="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-800 flex items-center justify-between gap-2 shrink-0"
    >
      <div class="flex items-center gap-1.5">
        <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
        <span>{{ locationError }}</span>
      </div>
      <button
        @click="resetToDefaultCenter"
        class="text-[11px] font-semibold underline hover:text-amber-900 shrink-0"
      >
        Dùng tọa độ Hà Nội
      </button>
    </div>

    <!-- Main Content Area: Fills 100% with no blank padding -->
    <main class="flex-1 relative w-full h-full overflow-hidden flex">
      <!-- 1. Interactive Map View: Full bleed edge-to-edge -->
      <section
        v-show="viewMode === 'map'"
        class="w-full h-full absolute inset-0 flex flex-col"
      >
        <LeafletMap @select-seller="openSellerModal" />
      </section>

      <!-- 2. Parallel List View -->
      <section
        v-show="viewMode === 'list'"
        class="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50"
      >
        <div class="max-w-6xl mx-auto space-y-4">
          <!-- List View Header -->
          <div class="flex items-center justify-between pb-2 border-b border-gray-200">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-gray-900">
                Các điểm thu mua & người bán gần bạn nhất
              </h2>
              <p class="text-xs text-gray-500">
                Được tự động sắp xếp theo khoảng cách tăng dần từ vị trí của bạn
              </p>
            </div>
            <span class="text-xs font-semibold px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
              {{ nearbySellers.length }} kết quả
            </span>
          </div>

          <!-- Empty State -->
          <div
            v-if="nearbySellers.length === 0"
            class="bg-white rounded-3xl border border-gray-200 p-12 text-center my-8 shadow-xs"
          >
            <div class="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageSearch class="w-8 h-8" />
            </div>
            <h3 class="text-base font-bold text-gray-800">Không tìm thấy điểm bán nào phù hợp</h3>
            <p class="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Thử tăng bán kính tìm kiếm (hiện tại {{ filters.radiusKm }}km) hoặc đặt lại bộ lọc.
            </p>
            <button
              @click="resetFilters"
              class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Mở rộng bán kính 10km & xóa lọc</span>
            </button>
          </div>

          <!-- Sellers List Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SellerCard
              v-for="seller in nearbySellers"
              :key="seller.userId"
              :seller="seller"
              @view-inventory="openSellerModal"
            />
          </div>
        </div>
      </section>
    </main>

    <!-- Seller Detail & Inventory Modal -->
    <SellerInventoryModal
      v-if="selectedSeller"
      :seller="selectedSeller"
      :products="sellerInventory"
      :is-loading="isInventoryLoading"
      @close="closeSellerModal"
    />

    <!-- Register Seller Modal (Đăng ký bán / Pass đồ) -->
    <RegisterSellerModal
      v-if="isRegisterModalOpen"
      @close="isRegisterModalOpen = false"
    />

    <!-- My Listings Modal (Quản lý tin đăng & Cập nhật Đã Bán) -->
    <MyListingsModal
      v-if="isMyListingsModalOpen"
      @close="isMyListingsModalOpen = false"
    />
  </div>
</template>
