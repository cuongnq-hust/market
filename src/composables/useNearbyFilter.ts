import { ref, reactive, watch } from 'vue';
import type {
  FilterState,
  Product,
  ProductWithSeller,
  SellerProfile,
  SellerWithDistance,
} from '../types/database';
import { useGeolocation } from './useGeolocation';
import { dataService, onSellersSync, broadcastSyncEvent } from '../services';

const { userLocation } = useGeolocation();

const filters = reactive<FilterState>({
  searchQuery: '',
  category: 'all',
  radiusKm: 5,
  onlyOpenNow: false,
  sellerType: 'all', // 'all' | 'store' | 'individual'
  priceRange: 'all',
});

const viewMode = ref<'map' | 'list'>('map');
const nearbySellers = ref<SellerWithDistance[]>([]);
const nearbyProducts = ref<ProductWithSeller[]>([]);
const isLoading = ref(false);

const selectedSeller = ref<SellerWithDistance | null>(null);
const sellerInventory = ref<Product[]>([]);
const isInventoryLoading = ref(false);

const isRegisterModalOpen = ref(false);
const isMyListingsModalOpen = ref(false);

const fetchNearbyData = async (options?: { isSilent?: boolean }) => {
  const isSilent = Boolean(options?.isSilent);
  if (!isSilent) {
    isLoading.value = true;
  }
  try {
    const [sellers, products] = await Promise.all([
      dataService.getNearbySellers(userLocation.value, filters),
      dataService.getNearbyProducts(userLocation.value, filters),
    ]);

    if (!isSilent) {
      nearbySellers.value = sellers;
      nearbyProducts.value = products;
    } else {
      // SILENT IN-PLACE SYNC (Không xóa mờ bản đồ, không giật màn hình của người dùng)
      // 1. Cập nhật các điểm bán hiện có tại chỗ
      sellers.forEach((newS) => {
        const existing = nearbySellers.value.find((s) => s.userId === newS.userId);
        if (existing) {
          existing.isOpenNow = newS.isOpenNow;
          existing.rating = newS.rating;
          existing.productsCount = newS.productsCount;
          existing.isSoldOut = newS.isSoldOut;
          existing.distanceKm = newS.distanceKm;
        }
      });
      // Bổ sung điểm bán mới xuất hiện
      const existingSellerIds = new Set(nearbySellers.value.map((s) => s.userId));
      const brandNewSellers = sellers.filter((s) => !existingSellerIds.has(s.userId));
      if (brandNewSellers.length > 0) {
        nearbySellers.value = [...nearbySellers.value, ...brandNewSellers];
      }
      // Loại bỏ điểm bán không còn khả dụng
      const fetchedSellerIds = new Set(sellers.map((s) => s.userId));
      nearbySellers.value = nearbySellers.value.filter((s) => fetchedSellerIds.has(s.userId));

      // 2. Cập nhật sản phẩm tại chỗ (đổi trạng thái sold êm ái)
      products.forEach((newP) => {
        const existing = nearbyProducts.value.find((p) => p.id === newP.id);
        if (existing) {
          existing.status = newP.status;
        }
      });
      const existingProductIds = new Set(nearbyProducts.value.map((p) => p.id));
      const brandNewProducts = products.filter((p) => !existingProductIds.has(p.id));
      if (brandNewProducts.length > 0) {
        nearbyProducts.value = [...nearbyProducts.value, ...brandNewProducts];
      }
      const fetchedProductIds = new Set(products.map((p) => p.id));
      nearbyProducts.value = nearbyProducts.value.filter((p) => fetchedProductIds.has(p.id));

      // 3. Nếu modal kho hàng đang mở, cập nhật trạng thái các món đồ trong kho êm ái
      if (selectedSeller.value) {
        try {
          const freshInventory = await dataService.getProductsBySellerId(selectedSeller.value.userId);
          freshInventory.forEach((freshItem) => {
            const existingItem = sellerInventory.value.find((i) => i.id === freshItem.id);
            if (existingItem) {
              existingItem.status = freshItem.status;
            }
          });
          const freshIds = new Set(freshInventory.map((i) => i.id));
          const brandNewItems = freshInventory.filter((i) => !sellerInventory.value.some((x) => x.id === i.id));
          if (brandNewItems.length > 0) {
            sellerInventory.value = [...sellerInventory.value, ...brandNewItems];
          }
          sellerInventory.value = sellerInventory.value.filter((i) => freshIds.has(i.id));
        } catch (err) {
          console.error('Error in-place syncing seller inventory:', err);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching nearby data:', err);
  } finally {
    if (!isSilent) {
      isLoading.value = false;
    }
  }
};

// Global module-level watcher
watch(
  [
    () => userLocation.value.latitude,
    () => userLocation.value.longitude,
    () => filters.searchQuery,
    () => filters.category,
    () => filters.radiusKm,
    () => filters.onlyOpenNow,
    () => filters.sellerType,
    () => filters.priceRange,
  ],
  () => {
    fetchNearbyData({ isSilent: false });
  },
  { immediate: true }
);

// Auto-sync across devices (Realtime) & cross tabs (Broadcast) - Luôn đồng bộ êm ngầm (isSilent: true)
onSellersSync(async (options) => {
  await fetchNearbyData({ isSilent: options?.isSilent ?? true });
});

export function useNearbyFilter() {
  const openSellerModal = async (seller: SellerWithDistance) => {
    selectedSeller.value = seller;
    isInventoryLoading.value = true;
    try {
      sellerInventory.value = await dataService.getProductsBySellerId(seller.userId);
    } catch (err) {
      console.error('Error fetching seller inventory:', err);
    } finally {
      isInventoryLoading.value = false;
    }
  };

  const closeSellerModal = () => {
    selectedSeller.value = null;
    sellerInventory.value = [];
  };

  const markProductAsSold = async (productId: string) => {
    const success = await dataService.markProductAsSold(productId);
    if (success) {
      // Refresh inventory if seller modal is open
      if (selectedSeller.value) {
        sellerInventory.value = await dataService.getProductsBySellerId(selectedSeller.value.userId);
      }
      // Refresh map and list
      await fetchNearbyData();
      broadcastSyncEvent('SELLERS_CHANGED');
    }
    return success;
  };

  const markProductAsAvailable = async (productId: string) => {
    const success = await dataService.markProductAsAvailable(productId);
    if (success) {
      if (selectedSeller.value) {
        sellerInventory.value = await dataService.getProductsBySellerId(selectedSeller.value.userId);
      }
      await fetchNearbyData();
      broadcastSyncEvent('SELLERS_CHANGED');
    }
    return success;
  };

  const registerNewSeller = async (
    sellerData: Omit<SellerProfile, 'isSoldOut'>,
    initialProduct?: Omit<Product, 'id' | 'sellerId' | 'status' | 'createdAt'>
  ) => {
    const res = await dataService.registerSeller(sellerData, initialProduct);
    await fetchNearbyData();
    broadcastSyncEvent('SELLERS_CHANGED');
    return res;
  };

  return {
    filters,
    viewMode,
    nearbySellers,
    nearbyProducts,
    isLoading,
    selectedSeller,
    sellerInventory,
    isInventoryLoading,
    isRegisterModalOpen,
    isMyListingsModalOpen,
    fetchNearbyData,
    openSellerModal,
    closeSellerModal,
    markProductAsSold,
    markProductAsAvailable,
    registerNewSeller,
  };
}
