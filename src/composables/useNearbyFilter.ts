import { ref, reactive, watch } from 'vue';
import type {
  FilterState,
  Product,
  ProductWithSeller,
  SellerProfile,
  SellerWithDistance,
} from '../types/database';
import { useGeolocation } from './useGeolocation';
import { dataService } from '../services';

const { userLocation } = useGeolocation();

const filters = reactive<FilterState>({
  searchQuery: '',
  category: 'all',
  radiusKm: 5,
  onlyOpenNow: false,
  sellerType: 'all', // 'all' | 'store' | 'individual'
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

const fetchNearbyData = async () => {
  isLoading.value = true;
  try {
    const [sellers, products] = await Promise.all([
      dataService.getNearbySellers(userLocation.value, filters),
      dataService.getNearbyProducts(userLocation.value, filters),
    ]);
    nearbySellers.value = sellers;
    nearbyProducts.value = products;
  } catch (err) {
    console.error('Error fetching nearby data:', err);
  } finally {
    isLoading.value = false;
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
  ],
  () => {
    fetchNearbyData();
  },
  { immediate: true }
);

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
    }
    return success;
  };

  const registerNewSeller = async (
    sellerData: Omit<SellerProfile, 'isSoldOut'>,
    initialProduct?: Omit<Product, 'id' | 'sellerId' | 'status' | 'createdAt'>
  ) => {
    const res = await dataService.registerSeller(sellerData, initialProduct);
    await fetchNearbyData();
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
