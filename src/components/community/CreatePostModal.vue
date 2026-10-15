<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  X,
  Plus,
  Zap,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-vue-next';
import { useForum } from '../../composables/useForum';
import type { ForumPostType, ProductCategory, ProductPrice } from '../../types/database';
import { CATEGORIES, HANOI_DISTRICTS } from '../../utils/constants';
import { compressImageFile } from '../../utils/imageCompressor';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { createPost, isCreateModalOpen, forumFilters } = useForum();

const form = reactive({
  type: forumFilters.postType as ForumPostType,
  title: '',
  content: '',
  category: 'appliances' as ProductCategory,
  priceMode: 'number' as 'number' | 'negotiable' | 'free',
  priceAmount: 500000,
  district: 'Cầu Giấy',
  city: 'Hà Nội',
  isUrgent: false,
  authorName: 'Nguyễn Văn Minh',
  phone: '0988776655',
  zalo: '0988776655',
  images: [
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=700&q=80',
  ],
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploadingImage = ref(false);
const customImageUrl = ref('');
const isSubmitting = ref(false);

// Preset sample photos for quick demo
const presetImages = [
  { label: 'Tủ lạnh / Gia dụng', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=700&q=80' },
  { label: 'Bàn ghế / Nội thất', url: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=700&q=80' },
  { label: 'Linh kiện / PC', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=80' },
  { label: 'Ve chai / Phế liệu', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80' },
  { label: 'Sách truyện', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80' },
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
      // Compress client-side to lightweight JPEG DataURL
      const compressedDataUrl = await compressImageFile(file, 1000, 0.8);
      addImage(compressedDataUrl);
    }
  } catch (err) {
    console.error('Lỗi nén ảnh:', err);
  } finally {
    isUploadingImage.value = false;
    // Reset file input so user can choose same file again if needed
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

  // Auto add https:// if missing
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
    url = 'https://' + url;
  }

  addImage(url);
  customImageUrl.value = '';
};

const handleSubmit = async () => {
  if (!form.title.trim() || !form.content.trim()) return;

  isSubmitting.value = true;
  try {
    let finalPrice: ProductPrice = form.priceAmount;
    if (form.priceMode === 'negotiable') finalPrice = 'negotiable';
    if (form.priceMode === 'free') finalPrice = 'free';

    await createPost({
      type: form.type,
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      price: finalPrice,
      images: [...form.images],
      district: form.district,
      city: form.city,
      isUrgent: form.isUrgent,
      author: {
        id: `user-${Date.now()}`,
        name: form.authorName.trim() || 'Người dùng ẩn danh',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        phone: form.phone.trim(),
        zalo: form.zalo.trim(),
        role: form.type === 'sell' ? 'seller' : 'buyer',
      },
    });

    isCreateModalOpen.value = false;
    emit('close');
  } catch (err) {
    console.error('Failed to create post:', err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
    <div class="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/60 to-white">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
            <Plus class="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 class="text-lg font-black text-gray-900 leading-tight">Đăng Tin Diễn Đàn</h2>
            <p class="text-xs text-gray-500">Kết nối nhanh người bán và người thu mua đồ cũ</p>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition active:scale-90"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
        <!-- 1. Post Type Selector (2 Tabs) -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">
            Loại tin đăng <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200">
            <button
              type="button"
              @click="form.type = 'sell'"
              class="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition"
              :class="form.type === 'sell'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'"
            >
              <span>⚡</span>
              <span>Cần Bán / Thanh Lý Gấp</span>
            </button>

            <button
              type="button"
              @click="form.type = 'buy'"
              class="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition"
              :class="form.type === 'buy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'"
            >
              <span>🔍</span>
              <span>Tìm Mua / Gom Hàng</span>
            </button>
          </div>
        </div>

        <!-- 2. Post Title -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">
            Tiêu đề bài viết <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            required
            type="text"
            placeholder="Ví dụ: Dọn phòng cần pass Tủ lạnh Aqua 90L còn mới 90%..."
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
          />
        </div>

        <!-- 3. Category & District Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Category -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Danh mục hàng hóa</label>
            <select
              v-model="form.category"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white"
            >
              <option v-for="cat in CATEGORIES" :key="cat.key" :value="cat.key">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <!-- District -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Khu vực (Quận / Huyện)</label>
            <select
              v-model="form.district"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white"
            >
              <option v-for="d in HANOI_DISTRICTS" :key="d" :value="d">
                {{ d }}
              </option>
            </select>
          </div>
        </div>

        <!-- 4. Price Expectation -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">Mức giá kỳ vọng</label>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <button
              type="button"
              @click="form.priceMode = 'number'"
              class="py-2 px-2 text-xs font-bold rounded-xl border transition text-center"
              :class="form.priceMode === 'number'
                ? 'bg-orange-50 border-orange-500 text-orange-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              Số tiền cụ thể
            </button>

            <button
              type="button"
              @click="form.priceMode = 'negotiable'"
              class="py-2 px-2 text-xs font-bold rounded-xl border transition text-center"
              :class="form.priceMode === 'negotiable'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              Thương lượng
            </button>

            <button
              type="button"
              @click="form.priceMode = 'free'"
              class="py-2 px-2 text-xs font-bold rounded-xl border transition text-center"
              :class="form.priceMode === 'free'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              Tặng miễn phí 0đ
            </button>
          </div>

          <!-- Price Input if mode == 'number' -->
          <div v-if="form.priceMode === 'number'" class="relative">
            <input
              v-model.number="form.priceAmount"
              type="number"
              step="10000"
              min="0"
              placeholder="Nhập số tiền (VNĐ)"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
            />
            <span class="absolute right-3.5 top-2.5 text-xs text-gray-400 font-semibold">VNĐ</span>
          </div>
        </div>

        <!-- 5. Content Details -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">
            Nội dung chi tiết <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.content"
            required
            rows="3"
            placeholder="Mô tả chi tiết tình trạng đồ cũ, kích thước, lý do cần thanh lý, thời gian hẹn qua lấy..."
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
          ></textarea>
        </div>

        <!-- 6. Urgent Checkbox (if type == 'sell') -->
        <div v-if="form.type === 'sell'" class="p-3 bg-red-50/70 border border-red-200 rounded-xl">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              v-model="form.isUrgent"
              type="checkbox"
              class="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
            />
            <span class="text-xs font-bold text-red-800 flex items-center gap-1">
              <Zap class="w-3.5 h-3.5 fill-red-600 text-red-600" />
              Đánh dấu là "Thanh lý gấp trong 24h" (Ưu tiên hiển thị trên feed)
            </span>
          </label>
        </div>

        <!-- 7. Image Attachments with File Upload, Presets & URL -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ImageIcon class="w-4 h-4 text-orange-600" />
              <span>Hình ảnh đính kèm ({{ form.images.length }} ảnh)</span>
            </label>
            <span class="text-[11px] text-gray-400">Chọn từ máy hoặc dán link</span>
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
            <!-- 1. Upload from Computer/Phone button -->
            <button
              type="button"
              @click="triggerFileInput"
              :disabled="isUploadingImage"
              class="w-full py-2.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 hover:border-orange-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Loader2 v-if="isUploadingImage" class="w-4 h-4 animate-spin text-orange-600" />
              <Upload v-else class="w-4 h-4 text-orange-600" />
              <span>{{ isUploadingImage ? 'Đang nén & tải ảnh...' : 'Chọn ảnh từ máy / điện thoại' }}</span>
            </button>

            <!-- 2. Custom URL input with Enter key support -->
            <div class="flex items-center gap-1.5">
              <input
                v-model="customImageUrl"
                type="text"
                placeholder="Dán link ảnh và bấm Enter..."
                @keydown.enter.prevent="addCustomImage"
                class="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
              <button
                type="button"
                @click="addCustomImage"
                class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition shrink-0"
              >
                Thêm
              </button>
            </div>
          </div>

          <!-- Preset demo images -->
          <div class="mb-2">
            <span class="text-[11px] text-gray-400 block mb-1">Hoặc chọn nhanh ảnh mẫu có sẵn:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="preset in presetImages"
                :key="preset.label"
                type="button"
                @click="addImage(preset.url)"
                class="text-[11px] px-2 py-1 rounded-lg bg-gray-100 hover:bg-orange-100 hover:text-orange-700 text-gray-600 transition font-medium"
              >
                + {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Images Preview Thumbnails -->
          <div v-if="form.images.length > 0" class="flex flex-wrap gap-2 pt-1">
            <div
              v-for="(img, idx) in form.images"
              :key="idx"
              class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 group shrink-0 shadow-xs"
            >
              <img :src="img" alt="Preview" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="removeImage(idx)"
                class="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Xóa ảnh này"
              >
                <X class="w-5 h-5 text-red-400" />
                <span class="text-[9px] font-bold mt-0.5">Xóa</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 8. Contact Information -->
        <div class="pt-2 border-t border-gray-100">
          <label class="block text-xs font-bold text-gray-700 mb-2">Thông tin liên hệ của bạn</label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              v-model="form.authorName"
              required
              type="text"
              placeholder="Tên của bạn"
              class="px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <input
              v-model="form.phone"
              required
              type="tel"
              placeholder="Số điện thoại"
              class="px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <input
              v-model="form.zalo"
              type="tel"
              placeholder="Số Zalo (nếu có)"
              class="px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            :disabled="isSubmitting || !form.title.trim() || !form.content.trim()"
            class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition active:scale-95 disabled:bg-gray-300"
          >
            {{ isSubmitting ? 'Đang đăng tin...' : 'Đăng bài lên Diễn đàn' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
