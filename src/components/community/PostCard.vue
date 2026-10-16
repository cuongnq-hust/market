<script setup lang="ts">
import { ref } from 'vue';
import {
  Phone,
  MessageSquare,
  MapPin,
  Tag,
  Zap,
  Share2,
  Trash2,
  CheckCircle2,
  Clock,
  Heart,
  Flag,
  EyeOff,
} from 'lucide-vue-next';
import { computed } from 'vue';
import type { ForumPost } from '../../types/database';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';
import { useForum } from '../../composables/useForum';
import { useFavorites } from '../../composables/useFavorites';
import { useModeration } from '../../composables/useModeration';
import {
  generateContactMessage,
  openZaloWithTemplate,
  shareItem,
  getPostShareUrl,
} from '../../utils/share';

const props = defineProps<{
  post: ForumPost;
}>();

const { deletePost, markPostAsSold } = useForum();
const { isFavorite, toggleFavorite } = useFavorites();
const { isPostHidden, unhidePost, openReportModal } = useModeration();

const isFav = computed(() => isFavorite(props.post.id));
const isHidden = computed(() => isPostHidden(props.post.id));

const toastMessage = ref<string | null>(null);
const isDeleting = ref(false);
const isMarkingSold = ref(false);

const showToast = (msg: string) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = null;
  }, 4000);
};

const handleToggleWishlist = () => {
  const added = toggleFavorite({
    id: props.post.id,
    type: 'post',
    title: props.post.title,
    price: props.post.price,
    image: props.post.images?.[0],
    location: `${props.post.district}, ${props.post.city}`,
    authorOrShopName: props.post.author.name,
    phone: props.post.author.phone,
    zalo: props.post.author.zalo,
    targetUrl: `/community?post=${props.post.id}`,
  });
  showToast(added ? 'Đã lưu vào danh sách yêu thích! ❤️' : 'Đã bỏ lưu bài viết.');
};

const getCategoryLabel = (catKey: string) => {
  return CATEGORIES.find((c) => c.key === catKey)?.label || catKey;
};

const handleContactZalo = async () => {
  const phone = props.post.author.zalo || props.post.author.phone;
  const msg = generateContactMessage(props.post.title, formatPrice(props.post.price));
  const res = await openZaloWithTemplate(phone, msg);
  showToast(res.message);
};

const handleShare = async () => {
  const shareUrl = getPostShareUrl(props.post.id);
  const res = await shareItem({
    title: props.post.title,
    text: `[Pass Đồ Gần Nhà] ${props.post.title} - ${formatPrice(props.post.price)}`,
    url: shareUrl,
  });
  showToast(res.message);
};

const handleDelete = async () => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
    isDeleting.value = true;
    try {
      await deletePost(props.post.id);
    } finally {
      isDeleting.value = false;
    }
  }
};

const handleMarkSold = async () => {
  isMarkingSold.value = true;
  try {
    await markPostAsSold(props.post.id);
  } finally {
    isMarkingSold.value = false;
  }
};

const getExpiryText = (expiresAt?: string) => {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Đã hết hạn';
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `Còn ${days} ngày`;
};
</script>

<template>
  <!-- Nếu bài viết bị bạn ẩn hoặc do cộng đồng báo cáo vi phạm -->
  <div
    v-if="isHidden"
    :id="`post-${post.id}`"
    class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-slate-500 flex items-center justify-between gap-3 shadow-2xs transition-all duration-200"
  >
    <div class="flex items-center gap-2.5 min-w-0">
      <EyeOff class="w-4 h-4 text-slate-400 shrink-0" />
      <span class="truncate">
        Bài viết <strong class="text-slate-700">"{{ post.title }}"</strong> đã bị ẩn (do bạn ẩn hoặc nhận báo cáo xấu).
      </span>
    </div>
    <button
      type="button"
      @click="unhidePost(post.id)"
      class="text-blue-600 hover:text-blue-700 font-bold shrink-0 hover:underline cursor-pointer px-2 py-1"
    >
      Hiện lại
    </button>
  </div>

  <article
    v-else
    :id="`post-${post.id}`"
    class="rounded-2xl border transition-all duration-200 overflow-hidden relative"
    :class="post.status === 'sold'
      ? 'bg-slate-50/80 border-slate-200 opacity-80'
      : 'bg-white/95 border-blue-100/80 shadow-[0_2px_12px_rgba(37,99,235,0.04)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] hover:border-blue-200'"
  >
    <!-- Toast Alert Banner (Sao chép tin nhắn mẫu / Chia sẻ link) -->
    <div
      v-if="toastMessage"
      class="bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs z-10"
    >
      <span>{{ toastMessage }}</span>
      <button type="button" @click="toastMessage = null" class="text-white/80 hover:text-white ml-2 text-xs font-bold cursor-pointer">✕</button>
    </div>

    <!-- Post Header: Author Info & Badges -->
    <div class="p-4 sm:p-5 pb-3">
      <div class="flex items-start justify-between gap-3">
        <!-- Author Profile -->
        <div class="flex items-center gap-3">
          <img
            :src="post.author.avatar"
            :alt="post.author.name"
            class="w-11 h-11 rounded-full object-cover border-2 border-blue-100 shadow-xs shrink-0"
            loading="lazy"
          />

          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <h3 class="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {{ post.author.name }}
              </h3>
              <span
                v-if="post.author.role === 'seller'"
                class="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold"
              >
                Chủ kho/Vựa
              </span>
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span class="flex items-center gap-0.5 text-slate-600 font-medium">
                <MapPin class="w-3.5 h-3.5 text-blue-500" />
                {{ post.district }}, {{ post.city }}
              </span>
              <span>•</span>
              <span class="text-slate-400">{{ formatRelativeTime(post.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Badges (Sold, My Post, Expiry, Urgent, Post Type) -->
        <div class="flex items-center gap-1.5 flex-wrap justify-end">
          <!-- Sold Badge -->
          <span
            v-if="post.status === 'sold'"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700"
          >
            ĐÃ BÁN
          </span>

          <!-- My Post Badge -->
          <span
            v-if="post.isMyPost"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
          >
            <span>👤</span>
            <span>Tin của bạn</span>
          </span>

          <!-- Expiry countdown -->
          <span
            v-if="getExpiryText(post.expiresAt)"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500"
          >
            <Clock class="w-3 h-3 text-slate-400" />
            <span>{{ getExpiryText(post.expiresAt) }}</span>
          </span>

          <!-- Urgent Badge -->
          <span
            v-if="post.isUrgent"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200 shadow-xs"
          >
            <Zap class="w-3 h-3 fill-amber-500" />
            GẤP 24H
          </span>

          <!-- Post Type Badge -->
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs"
            :class="post.type === 'sell'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-sky-50 text-sky-700 border border-sky-200'"
          >
            {{ post.type === 'sell' ? '⚡ Cần Bán' : '🔍 Cần Mua' }}
          </span>
        </div>
      </div>

      <!-- Post Title & Content -->
      <div class="mt-3.5 space-y-2">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {{ post.title }}
        </h2>

        <p class="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {{ post.content }}
        </p>
      </div>

      <!-- Category & Price Bar -->
      <div class="mt-3 pt-3 border-t border-blue-50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <!-- Category Tag -->
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/50 text-slate-700 border border-blue-100/60 font-medium">
          <Tag class="w-3 h-3 text-slate-400" />
          {{ getCategoryLabel(post.category) }}
        </span>

        <!-- Expected Price Tag -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500 text-[11px]">Mức giá:</span>
          <span
            class="text-sm font-extrabold px-2.5 py-0.5 rounded-lg"
            :class="post.price === 'free'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : post.price === 'negotiable'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'"
          >
            {{ formatPrice(post.price) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Image Gallery (if any) -->
    <div v-if="post.images && post.images.length > 0" class="px-4 sm:px-5 pb-3">
      <!-- Single Image -->
      <div
        v-if="post.images.length === 1"
        class="rounded-xl overflow-hidden aspect-video max-h-72 w-full bg-gray-100 border border-gray-200"
      >
        <img
          :src="post.images[0]"
          :alt="post.title"
          class="w-full h-full object-cover hover:scale-102 transition duration-300"
          loading="lazy"
        />
      </div>

      <!-- Multiple Images Grid -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 gap-2"
      >
        <div
          v-for="(img, idx) in post.images.slice(0, 3)"
          :key="idx"
          class="rounded-xl overflow-hidden aspect-square bg-gray-100 border border-gray-200 relative group cursor-pointer"
        >
          <img
            :src="img"
            :alt="post.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <!-- Owner Actions Bar (Chỉ hiển thị cho người đăng trên thiết bị này) -->
    <div v-if="post.isMyPost" class="px-4 sm:px-5 py-2.5 bg-indigo-50/70 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs">
      <span class="text-indigo-900 font-bold flex items-center gap-1.5">
        <span>👤</span>
        <span>Quản lý tin của bạn:</span>
      </span>

      <div class="flex items-center gap-2">
        <!-- Mark as Sold -->
        <button
          v-if="post.status !== 'sold'"
          type="button"
          @click="handleMarkSold"
          :disabled="isMarkingSold"
          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>{{ isMarkingSold ? 'Đang lưu...' : 'Đã bán xong (Ẩn tin)' }}</span>
        </button>
        <span v-else class="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
          <span>Đã đánh dấu Đã bán</span>
        </span>

        <!-- Delete Post -->
        <button
          type="button"
          @click="handleDelete"
          :disabled="isDeleting"
          class="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          title="Xóa vĩnh viễn bài viết"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>{{ isDeleting ? 'Đang xóa...' : 'Xóa tin' }}</span>
        </button>
      </div>
    </div>

    <!-- Direct Contact Actions Bar (Tối giản: Gọi điện & Nhắn Zalo) -->
    <div class="p-4 sm:px-5 py-3 bg-gradient-to-r from-blue-50/60 via-sky-50/30 to-indigo-50/40 border-t border-blue-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="text-xs text-slate-500">
        Liên hệ người đăng: <strong class="text-slate-800">{{ post.author.name }}</strong>
      </div>

      <div class="flex items-center gap-2">
        <!-- Direct Phone Call -->
        <a
          v-if="post.author.phone"
          :href="`tel:${post.author.phone}`"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
        >
          <Phone class="w-3.5 h-3.5" />
          <span>Gọi: {{ post.author.phone }}</span>
        </a>

        <!-- Direct Zalo Chat with 1-touch Template -->
        <button
          v-if="post.author.zalo || post.author.phone"
          type="button"
          @click="handleContactZalo"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          title="Tự động sao chép tin nhắn mẫu và mở chat Zalo"
        >
          <MessageSquare class="w-3.5 h-3.5" />
          <span>Nhắn Zalo</span>
        </button>

        <!-- Web Share / Deep Link Button -->
        <button
          type="button"
          @click="handleShare"
          class="p-2 rounded-xl border border-blue-100/80 bg-white hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          title="Chia sẻ tin đăng này"
        >
          <Share2 class="w-3.5 h-3.5" />
        </button>

        <!-- Wishlist Bookmark Button -->
        <button
          type="button"
          @click="handleToggleWishlist"
          class="p-2 rounded-xl border transition shrink-0 cursor-pointer active:scale-90 shadow-2xs"
          :class="isFav ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-white border-blue-100/80 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50'"
          :title="isFav ? 'Bỏ lưu tin này' : 'Lưu tin vào danh sách yêu thích'"
        >
          <Heart class="w-3.5 h-3.5" :class="{ 'fill-rose-500': isFav }" />
        </button>

        <!-- Report Bad Post Button -->
        <button
          type="button"
          @click="openReportModal({ id: post.id, title: post.title, type: 'post' })"
          class="p-2 rounded-xl border border-blue-100/80 bg-white hover:bg-amber-50 hover:border-amber-200 text-slate-400 hover:text-amber-600 transition shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          title="Báo cáo tin vi phạm / tin xấu"
        >
          <Flag class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </article>
</template>
