<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import L from 'leaflet';
import type { SellerWithDistance } from '../../types/database';
import { useGeolocation } from '../../composables/useGeolocation';
import { useNearbyFilter } from '../../composables/useNearbyFilter';
import { formatDistance } from '../../utils/geo';
import { escapeHtml } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';

const emit = defineEmits<{
  (e: 'selectSeller', seller: SellerWithDistance): void;
}>();

const { userLocation, setCustomLocation } = useGeolocation();
const { nearbySellers, filters, viewMode } = useNearbyFilter();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let buyerMarker: L.Marker | null = null;
let radiusCircle: L.Circle | null = null;
let sellerMarkersGroup: L.LayerGroup | null = null;
let resizeObserver: ResizeObserver | null = null;

// Map category key to emoji
const categoryIcons: Record<string, string> = {
  electronics: '💻',
  appliances: '📺',
  furniture: '🪑',
  scrap: '♻️',
  books: '📚',
  baby: '🍼',
  cafe: '☕',
  fashion: '👕',
  other: '📦',
};

// Initialize Leaflet Map
const initMap = () => {
  if (!mapContainer.value) return;

  if (map) {
    map.remove();
    map = null;
  }

  // Create map centered on user
  map = L.map(mapContainer.value, {
    center: [userLocation.value.latitude, userLocation.value.longitude],
    zoom: 13,
    zoomControl: false,
  });

  // OpenStreetMap tile layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add Zoom control on top right
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Create layer group
  sellerMarkersGroup = L.layerGroup().addTo(map);

  updateBuyerMarker();
  updateRadiusCircle();
  updateSellerMarkers();

  // Relocate buyer on click
  map.on('click', (e: L.LeafletMouseEvent) => {
    setCustomLocation({
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
    });
  });

  // Delegated event listener for popup actions
  mapContainer.value.addEventListener('click', handlePopupClick);

  map.invalidateSize();
};

const handlePopupClick = (e: MouseEvent) => {
  const target = (e.target as HTMLElement).closest('[data-action]');
  if (!target) return;

  const action = target.getAttribute('data-action');
  const sellerId = target.getAttribute('data-seller-id');

  if (sellerId) {
    const seller = nearbySellers.value.find((s) => s.userId === sellerId);
    if (seller) {
      if (action === 'view-inventory') {
        emit('selectSeller', seller);
      }
    }
  }
};

// Update Buyer Marker (Draggable Blue Marker)
const updateBuyerMarker = () => {
  if (!map) return;

  const latLng: [number, number] = [
    userLocation.value.latitude,
    userLocation.value.longitude,
  ];

  const buyerIcon = L.divIcon({
    className: 'custom-buyer-icon',
    html: `
      <div class="user-buyer-marker" title="Vị trí của bạn (Kéo thả hoặc click để đổi)">
        <div class="user-buyer-pulse"></div>
        <div class="user-buyer-dot"></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  if (!buyerMarker) {
    buyerMarker = L.marker(latLng, {
      icon: buyerIcon,
      draggable: true,
      zIndexOffset: 1000,
    }).addTo(map);

    buyerMarker.on('dragend', (e) => {
      const marker = e.target as L.Marker;
      const position = marker.getLatLng();
      setCustomLocation({
        latitude: position.lat,
        longitude: position.lng,
      });
    });

    buyerMarker.bindTooltip('📍 Vị trí của bạn (Kéo thả hoặc click bản đồ để đổi)', {
      permanent: false,
      direction: 'top',
      offset: [0, -15],
    });
  } else {
    buyerMarker.setLatLng(latLng);
  }
};

// Update Radius Circle
const updateRadiusCircle = () => {
  if (!map) return;

  const latLng: [number, number] = [
    userLocation.value.latitude,
    userLocation.value.longitude,
  ];
  const radiusMeters = filters.radiusKm * 1000;

  if (!radiusCircle) {
    radiusCircle = L.circle(latLng, {
      radius: radiusMeters,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      weight: 1.5,
      dashArray: '5, 5',
    }).addTo(map);
  } else {
    radiusCircle.setLatLng(latLng);
    radiusCircle.setRadius(radiusMeters);
  }
};

// Render Seller Markers with Custom Popup Card
const updateSellerMarkers = () => {
  if (!map || !sellerMarkersGroup) return;

  sellerMarkersGroup.clearLayers();

  nearbySellers.value.forEach((seller) => {
    const mainCategory = seller.categories[0] || 'other';
    const emoji = categoryIcons[mainCategory] || '🏪';
    const isClosed = !seller.isOpenNow;
    const isIndividual = seller.sellerType === 'individual';

    // Different pin design for Individual vs Store
    const pinClass = isIndividual
      ? 'seller-pin individual border-purple-600 shadow-purple-500/30'
      : `seller-pin ${isClosed ? 'closed' : ''}`;

    const iconHtml = `
      <div class="${pinClass}" title="${seller.shopName} (${isIndividual ? 'Người bán đơn lẻ' : 'Vựa thu mua'})">
        <span class="text-base select-none">${emoji}</span>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'custom-seller-icon',
      html: iconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });

    const marker = L.marker([seller.latitude, seller.longitude], {
      icon: customIcon,
    });

    // Format Categories badges
    const categoryBadgesHtml = seller.categories
      .slice(0, 3)
      .map((catKey) => {
        const catMeta = CATEGORIES.find((c) => c.key === catKey);
        const label = escapeHtml(catMeta?.label || catKey);
        return `<span class="inline-block text-[10px] px-2 py-0.5 rounded-full ${catMeta?.badgeBg || 'bg-gray-100'} ${catMeta?.badgeText || 'text-gray-700'} font-medium mr-1">${label}</span>`;
      })
      .join('');

    // Popup Card Content
    const popupContent = `
      <div class="w-72 bg-white rounded-xl overflow-hidden font-sans">
        <!-- Header -->
        <div class="p-3.5 ${
          isIndividual
            ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-white border-b border-purple-100'
            : 'bg-gradient-to-r from-blue-50 via-sky-50 to-white border-b border-blue-100'
        }">
          <div class="flex items-start justify-between gap-1.5">
            <div>
              <span class="inline-block text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider mb-1 ${
                isIndividual ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }">
                ${isIndividual ? '👤 Cá nhân pass đồ' : '🏪 Vựa thu mua'}
              </span>
              <h3 class="font-bold text-slate-900 text-sm leading-snug">${escapeHtml(seller.shopName)}</h3>
            </div>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
              seller.isOpenNow ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }">
              ${seller.isOpenNow ? '● Mở' : '○ Đóng'}
            </span>
          </div>

          <p class="text-xs text-blue-700 font-semibold mt-1 flex items-center gap-1">
            📍 Cách bạn ${formatDistance(seller.distanceKm)}
          </p>
        </div>

        <!-- Body -->
        <div class="p-3.5 space-y-2 text-xs text-slate-600">
          <p class="text-[11px] text-slate-500 line-clamp-1">
            ${escapeHtml(seller.address)}
          </p>

          <div>
            <div class="text-[10px] text-slate-400 mb-1">Mặt hàng:</div>
            <div class="flex flex-wrap gap-y-1">${categoryBadgesHtml}</div>
          </div>

          <p class="text-[11px] text-slate-500 line-clamp-2 italic pt-1 border-t border-blue-50">
            "${escapeHtml(seller.description || 'Điểm thanh lý đồ cũ.')}"
          </p>

          ${
            isIndividual
              ? '<div class="text-[10px] text-purple-700 bg-purple-50/80 p-1.5 rounded-lg border border-purple-200 font-medium">✨ Điểm bán cá nhân: Tự động ẩn khỏi bản đồ sau khi bán xong đồ.</div>'
              : ''
          }
        </div>

        <!-- Footer Actions -->
        <div class="p-3 bg-blue-50/30 border-t border-blue-100/70 flex items-center gap-2">
          <a
            href="tel:${escapeHtml(seller.phone || '')}"
            class="flex-1 text-center py-2 px-2.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1"
          >
            📞 Gọi điện
          </a>
          <button
            type="button"
            data-action="view-inventory"
            data-seller-id="${escapeHtml(seller.userId)}"
            class="flex-1 text-center py-2 px-2.5 rounded-lg ${
              isIndividual ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            📦 Kho đồ (${seller.productsCount || 0})
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 320,
      minWidth: 280,
      className: 'custom-popup-window',
    });

    sellerMarkersGroup?.addLayer(marker);
  });
};

// Re-center map on buyer
const centerOnUser = () => {
  if (!map) return;
  map.flyTo([userLocation.value.latitude, userLocation.value.longitude], 14, {
    duration: 1,
  });
};

// Fit bounds
const fitAllBounds = () => {
  if (!map || nearbySellers.value.length === 0) return;

  const points: L.LatLngExpression[] = [
    [userLocation.value.latitude, userLocation.value.longitude],
    ...nearbySellers.value.map(
      (s) => [s.latitude, s.longitude] as [number, number]
    ),
  ];

  const bounds = L.latLngBounds(points);
  map.fitBounds(bounds, { padding: [50, 50] });
};

// Watchers
watch(
  [() => userLocation.value.latitude, () => userLocation.value.longitude],
  () => {
    updateBuyerMarker();
    updateRadiusCircle();
  }
);

watch(() => filters.radiusKm, () => {
  updateRadiusCircle();
});

watch(
  () => nearbySellers.value,
  () => {
    updateSellerMarkers();
  },
  { deep: true, immediate: true }
);

// Invalidate size on viewMode switch
watch(
  () => viewMode.value,
  (mode) => {
    if (mode === 'map') {
      nextTick(() => {
        setTimeout(() => {
          map?.invalidateSize();
        }, 50);
      });
    }
  }
);

onMounted(() => {
  initMap();

  if (typeof ResizeObserver !== 'undefined' && mapContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize();
    });
    resizeObserver.observe(mapContainer.value);
  }

  setTimeout(() => {
    map?.invalidateSize();
  }, 100);

  setTimeout(() => {
    map?.invalidateSize();
  }, 400);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (mapContainer.value) {
    mapContainer.value.removeEventListener('click', handlePopupClick);
  }
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div class="relative w-full h-full flex-1 min-h-[500px]">
    <!-- Map Container -->
    <div ref="mapContainer" class="absolute inset-0 w-full h-full z-0 bg-slate-100"></div>

    <!-- Floating Map Control Buttons (Bottom Right) -->
    <div class="absolute bottom-5 right-5 z-[400] flex flex-col gap-2">
      <button
        @click="centerOnUser"
        class="w-10 h-10 rounded-xl bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition active:scale-95"
        title="Đưa bản đồ về vị trí của tôi"
      >
        <span class="text-lg">🎯</span>
      </button>

      <button
        @click="fitAllBounds"
        class="w-10 h-10 rounded-xl bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition active:scale-95"
        title="Xem bao quát tất cả điểm bán trong bán kính"
      >
        <span class="text-lg">🗺️</span>
      </button>
    </div>

    <!-- Legend & Relocation Hint (Top Left) -->
    <div class="absolute top-4 left-4 z-[400] flex flex-col gap-1.5 pointer-events-none sm:pointer-events-auto">
      <div class="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md border border-gray-200 text-xs text-gray-700 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
        <span>Kéo <strong>marker xanh</strong> để đổi vị trí</span>
      </div>

      <!-- Marker Legend -->
      <div class="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border border-gray-200 text-[11px] text-gray-600">
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          Vựa thu mua
        </span>
        <span>•</span>
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
          Cá nhân pass đồ
        </span>
      </div>
    </div>
  </div>
</template>
