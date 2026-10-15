<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  X,
  Store,
  User,
  Plus,
  Navigation,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-vue-next';
import { useNearbyFilter } from '../../composables/useNearbyFilter';
import { useGeolocation } from '../../composables/useGeolocation';
import type { ProductCategory, ProductCondition, ProductPrice, SellerType } from '../../types/database';
import { CATEGORIES } from '../../utils/constants';
import { compressImageFile } from '../../utils/imageCompressor';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { registerNewSeller, isRegisterModalOpen } = useNearbyFilter();
const { userLocation } = useGeolocation();

const form = reactive({
  sellerType: 'individual' as SellerType,
  shopName: '',
  address: 'Số 28 ngõ 68 Cầu Giấy, Hà Nội',
  latitude: userLocation.value.latitude,
  longitude: userLocation.value.longitude,
  phone: '0981234567',
  zalo: '0981234567',
  description: '',
  // Initial product
  productTitle: '',
  category: 'appliances' as ProductCategory,
  priceMode: 'number' as 'number' | 'negotiable' | 'free',
  priceAmount: 450000,
  condition: 'used' as ProductCondition,
  images: [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80',
  ],
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploadingImage = ref(false);
const customImageUrl = ref('');
const isSubmitting = ref(false);

const presetImages = [
  { label: 'Tủ lạnh / Gia dụng', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Bàn ghế / Nội thất', url: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80' },
  { label: 'Linh kiện / Máy tính', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80' },
  { label: 'Xe đạp / Xe cộ', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Ve chai / Phế liệu', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80' },
];

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  isUploadingImage.value = true;
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressedDataUrl = await compressImageFile(file, 1000, 0.8);
      addImage(compressedDataUrl);
    }
  } catch (err) {
    console.error('Lỗi nén ảnh:', err);
  } finally {
    isUploadingImage.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

const addImage = (url: string) => {
  if (url && !form.images.includes(url)) {
    form.images.push(url);
  }
};

const removeImage = (idx: number) => {
  form.images.splice(idx, 1);
};

const addCustomImage = () => {
  let url = customImageUrl.value.trim();
  if (!url) return;

  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
    url = 'https://' + url;
  }

  addImage(url);
  customImageUrl.value = '';
};

const useCurrentGpsLocation = () => {
  form.latitude = userLocation.value.latitude;
  form.longitude = userLocation.value.longitude;
};

const handleSubmit = async () => {
  if (!form.shopName.trim()) return;

  isSubmitting.value = true;
  try {
    const userId = `my-seller-${Date.now()}`;
    let finalPrice: ProductPrice = form.priceAmount;
    if (form.priceMode === 'negotiable') finalPrice = 'negotiable';
    if (form.priceMode === 'free') finalPrice = 'free';

    await registerNewSeller(
      {
        userId,
        shopName: form.shopName.trim(),
        sellerType: form.sellerType,
        address: form.address.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        categories: [form.category],
        openTime: form.sellerType === 'individual' ? '07:00' : '08:00',
        closeTime: form.sellerType === 'individual' ? '22:00' : '20:00',
        isOpenNow: true,
        phone: form.phone.trim(),
        zalo: form.zalo.trim(),
        rating: 5.0,
        isVerified: true,
        description: form.description.trim() || (form.sellerType === 'individual' ? 'Người bán đơn lẻ thanh lý đồ dọn nhà' : 'Điểm thu mua & thanh lý phế liệu'),
      },
      form.productTitle.trim()
        ? {
            title: form.productTitle.trim(),
            description: form.description.trim() || 'Món đồ thanh lý còn sử dụng tốt.',
            category: form.category,
            price: finalPrice,
            condition: form.condition,
            images: [...form.images],
          }
        : undefined
    );

    isRegisterModalOpen.value = false;
    emit('close');
  } catch (err) {
    console.error('Failed to register seller:', err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
    <div class="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-emerald-50">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
            <Plus class="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 class="text-lg font-black text-gray-900 leading-tight">Đăng Ký Bán / Pass Đồ Cũ</h2>
            <p class="text-xs text-gray-500">Ghim vị trí lên bản đồ để người xung quanh tìm thấy bạn</p>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-500 flex items-center justify-center shadow-xs transition active:scale-90"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
        <!-- 1. Seller Type Selection (Individual vs Store) -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">
            Hình thức người bán <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Individual Seller -->
            <button
              type="button"
              @click="form.sellerType = 'individual'"
              class="p-3 rounded-2xl border-2 text-left transition flex flex-col gap-1"
              :class="form.sellerType === 'individual'
                ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-xs'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              <div class="flex items-center justify-between">
                <span class="font-black text-xs sm:text-sm flex items-center gap-1.5">
                  <User class="w-4 h-4 text-purple-600" />
                  Người bán cá nhân / Đơn lẻ
                </span>
                <span v-if="form.sellerType === 'individual'" class="w-2 h-2 rounded-full bg-purple-600"></span>
              </div>
              <p class="text-[11px] text-gray-500">
                Thanh lý đồ dọn nhà, chuyển trọ. Sau khi bán xong sẽ tự động ẩn khỏi bản đồ.
              </p>
            </button>

            <!-- Store / Scrap Yard -->
            <button
              type="button"
              @click="form.sellerType = 'store'"
              class="p-3 rounded-2xl border-2 text-left transition flex flex-col gap-1"
              :class="form.sellerType === 'store'
                ? 'border-orange-600 bg-orange-50/70 text-orange-900 shadow-xs'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              <div class="flex items-center justify-between">
                <span class="font-black text-xs sm:text-sm flex items-center gap-1.5">
                  <Store class="w-4 h-4 text-orange-600" />
                  Vựa thu mua / Cửa hàng
                </span>
                <span v-if="form.sellerType === 'store'" class="w-2 h-2 rounded-full bg-orange-600"></span>
              </div>
              <p class="text-[11px] text-gray-500">
                Điểm thu mua phế liệu, đồ cũ cố định lâu dài, mở cửa hoạt động hàng ngày.
              </p>
            </button>
          </div>
        </div>

        <!-- 2. Seller Name & Contact -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">
              {{ form.sellerType === 'individual' ? 'Tên của bạn / Tên người bán' : 'Tên cửa hàng / Vựa thu mua' }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.shopName"
              required
              type="text"
              :placeholder="form.sellerType === 'individual' ? 'Ví dụ: Bạn Nam (Dọn phòng trọ)' : 'Ví dụ: Vựa Ve Chai & Đồ Cũ Cầu Giấy'"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Số điện thoại liên hệ <span class="text-red-500">*</span></label>
            <input
              v-model="form.phone"
              required
              type="tel"
              placeholder="098..."
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>
        </div>

        <!-- 3. Address & GPS Coordinates -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-bold text-gray-700">Địa chỉ ghim trên bản đồ <span class="text-red-500">*</span></label>
            <button
              type="button"
              @click="useCurrentGpsLocation"
              class="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
            >
              <Navigation class="w-3 h-3" />
              <span>Ghim theo GPS hiện tại của tôi</span>
            </button>
          </div>
          <input
            v-model="form.address"
            required
            type="text"
            placeholder="Số nhà, tên ngõ, đường, quận huyện..."
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
          />
        </div>

        <!-- 4. First Product To Sell (Món đồ đăng bán) -->
        <div class="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-gray-900 uppercase tracking-wide">
              📦 Món đồ cũ cần đăng bán / thanh lý
            </span>
            <span class="text-[11px] text-gray-400">Hiển thị ngay trên kho hàng</span>
          </div>

          <!-- Product Title -->
          <div>
            <input
              v-model="form.productTitle"
              type="text"
              placeholder="Tên món đồ (Ví dụ: Tủ lạnh mini 90L, Ghế xoay văn phòng...)"
              class="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <!-- Category & Condition -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-bold text-gray-600 mb-1">Danh mục</label>
              <select
                v-model="form.category"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option v-for="cat in CATEGORIES" :key="cat.key" :value="cat.key">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-gray-600 mb-1">Tình trạng đồ</label>
              <select
                v-model="form.condition"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="new">Mới 100% (Nguyên seal)</option>
                <option value="used">Đã qua sử dụng (Còn tốt)</option>
                <option value="scrap">Ve chai / Xác máy rã linh kiện</option>
              </select>
            </div>
          </div>

          <!-- Price Mode & Amount -->
          <div>
            <label class="block text-[11px] font-bold text-gray-600 mb-1">Mức giá bán</label>
            <div class="grid grid-cols-3 gap-1.5 mb-2">
              <button
                type="button"
                @click="form.priceMode = 'number'"
                class="py-1.5 px-2 text-xs font-bold rounded-lg border text-center transition"
                :class="form.priceMode === 'number' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-600'"
              >
                Số tiền cụ thể
              </button>
              <button
                type="button"
                @click="form.priceMode = 'negotiable'"
                class="py-1.5 px-2 text-xs font-bold rounded-lg border text-center transition"
                :class="form.priceMode === 'negotiable' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'"
              >
                Thương lượng
              </button>
              <button
                type="button"
                @click="form.priceMode = 'free'"
                class="py-1.5 px-2 text-xs font-bold rounded-lg border text-center transition"
                :class="form.priceMode === 'free' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'"
              >
                Tặng 0đ
              </button>
            </div>

            <div v-if="form.priceMode === 'number'" class="relative">
              <input
                v-model.number="form.priceAmount"
                type="number"
                step="10000"
                min="0"
                placeholder="Nhập giá tiền (VNĐ)"
                class="w-full px-3 py-2 text-xs sm:text-sm font-bold border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <span class="absolute right-3.5 top-2 text-xs text-gray-400 font-semibold">VNĐ</span>
            </div>
          </div>

          <!-- Image Selection with File Upload, Presets & URL -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                <ImageIcon class="w-3.5 h-3.5 text-brand-600" />
                <span>Ảnh món đồ ({{ form.images.length }} ảnh)</span>
              </span>
              <span class="text-[10px] text-gray-400">Chọn từ máy hoặc dán link</span>
            </div>

            <!-- Hidden native file input -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleFileUpload"
            />

            <!-- Upload Actions Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
              <!-- Upload from Computer/Phone -->
              <button
                type="button"
                @click="triggerFileInput"
                :disabled="isUploadingImage"
                class="w-full py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 hover:border-brand-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Loader2 v-if="isUploadingImage" class="w-3.5 h-3.5 animate-spin text-brand-600" />
                <Upload v-else class="w-3.5 h-3.5 text-brand-600" />
                <span>{{ isUploadingImage ? 'Đang nén ảnh...' : 'Chọn ảnh từ máy / điện thoại' }}</span>
              </button>

              <!-- Custom URL input -->
              <div class="flex items-center gap-1">
                <input
                  v-model="customImageUrl"
                  type="text"
                  placeholder="Dán link ảnh và Enter..."
                  @keydown.enter.prevent="addCustomImage"
                  class="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  @click="addCustomImage"
                  class="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Thêm
                </button>
              </div>
            </div>

            <!-- Presets -->
            <div class="flex flex-wrap gap-1 mb-2">
              <button
                v-for="preset in presetImages"
                :key="preset.label"
                type="button"
                @click="addImage(preset.url)"
                class="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-gray-200 hover:border-brand-400 hover:text-brand-700 text-gray-600 font-medium transition"
              >
                + {{ preset.label }}
              </button>
            </div>

            <!-- Preview Thumbnails -->
            <div v-if="form.images.length > 0" class="flex flex-wrap gap-2 pt-1">
              <div
                v-for="(img, idx) in form.images"
                :key="idx"
                class="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 group shrink-0 shadow-xs"
              >
                <img :src="img" alt="Product" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="removeImage(idx)"
                  class="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X class="w-4 h-4 text-red-400" />
                  <span class="text-[8px] font-bold">Xóa</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Description Note -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Mô tả thêm</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Lưu ý về giờ hẹn, tình trạng đồ cũ hoặc thông tin thêm..."
            class="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
          ></textarea>
        </div>

        <!-- Submit & Cancel -->
        <div class="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Hủy
          </button>

          <button
            type="submit"
            :disabled="isSubmitting || !form.shopName.trim()"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 transition active:scale-95 disabled:bg-gray-300"
          >
            {{ isSubmitting ? 'Đang đăng ký...' : 'Xác nhận ghim lên bản đồ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
