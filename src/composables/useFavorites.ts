import { ref, computed } from 'vue';
import type { FavoriteItem } from '../types/database';

const FAVORITES_STORAGE_KEY = 'passdo_favorites_v1';

const favorites = ref<FavoriteItem[]>([]);
const isWishlistModalOpen = ref(false);

// Load from LocalStorage
const loadFavorites = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw) {
      favorites.value = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Lỗi đọc danh sách yêu thích:', err);
  }
};

// Save to LocalStorage
const saveFavorites = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites.value));
  } catch (err) {
    console.warn('Lỗi lưu danh sách yêu thích:', err);
  }
};

// Khởi tạo ngay khi module được import
loadFavorites();

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === FAVORITES_STORAGE_KEY) {
      loadFavorites();
    }
  });
}

export function useFavorites() {
  const isFavorite = (id: string): boolean => {
    return favorites.value.some((f) => f.id === id);
  };

  const toggleFavorite = (item: Omit<FavoriteItem, 'savedAt'>): boolean => {
    const index = favorites.value.findIndex((f) => f.id === item.id);
    if (index >= 0) {
      // Đã có -> Xóa khỏi yêu thích
      favorites.value.splice(index, 1);
      saveFavorites();
      return false;
    } else {
      // Chưa có -> Thêm vào yêu thích
      const newItem: FavoriteItem = {
        ...item,
        savedAt: new Date().toISOString(),
      };
      favorites.value.unshift(newItem);
      saveFavorites();
      return true;
    }
  };

  const removeFavorite = (id: string) => {
    favorites.value = favorites.value.filter((f) => f.id !== id);
    saveFavorites();
  };

  const clearFavorites = () => {
    favorites.value = [];
    saveFavorites();
  };

  const favoritesCount = computed(() => favorites.value.length);

  return {
    favorites,
    favoritesCount,
    isWishlistModalOpen,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
