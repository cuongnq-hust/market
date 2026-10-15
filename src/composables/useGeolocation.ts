import { ref } from 'vue';
import type { GeoLocation } from '../types/database';
import { DEFAULT_HANOI_COORDINATES } from '../utils/constants';

const userLocation = ref<GeoLocation>({ ...DEFAULT_HANOI_COORDINATES });
const isLocating = ref(false);
const locationError = ref<string | null>(null);
const isCustomLocation = ref(false);

export function useGeolocation() {
  /**
   * Request GPS from browser
   */
  const requestCurrentLocation = (): Promise<GeoLocation> => {
    isLocating.value = true;
    locationError.value = null;

    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        locationError.value = 'Trình duyệt không hỗ trợ Geolocation. Sử dụng tọa độ mặc định Hà Nội.';
        isLocating.value = false;
        resolve(userLocation.value);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          isCustomLocation.value = false;
          isLocating.value = false;
          resolve(userLocation.value);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          let errorMsg = 'Không thể lấy vị trí GPS thực tế. Sử dụng vị trí trung tâm Hà Nội.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Bạn đã từ chối quyền truy cập vị trí. Đang dùng vị trí mặc định tại Hà Nội.';
          }
          locationError.value = errorMsg;
          isLocating.value = false;
          resolve(userLocation.value);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  /**
   * Manually set location (via dragging marker or clicking map)
   */
  const setCustomLocation = (coords: GeoLocation) => {
    userLocation.value = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
    isCustomLocation.value = true;
    locationError.value = null;
  };

  /**
   * Reset back to Hanoi center
   */
  const resetToDefaultCenter = () => {
    userLocation.value = { ...DEFAULT_HANOI_COORDINATES };
    isCustomLocation.value = false;
  };

  return {
    userLocation,
    isLocating,
    locationError,
    isCustomLocation,
    requestCurrentLocation,
    setCustomLocation,
    resetToDefaultCenter,
  };
}
