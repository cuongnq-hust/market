<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Send, Tag, MessageCircle, DollarSign } from 'lucide-vue-next';
import type { ForumComment } from '../../types/database';
import { useForum } from '../../composables/useForum';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';

const props = defineProps<{
  postId: string;
}>();

const { getComments, submitComment } = useForum();

const comments = ref<ForumComment[]>([]);
const isLoading = ref(false);
const newCommentText = ref('');
const showOfferInput = ref(false);
const offerPriceAmount = ref<number | null>(null);
const isSubmitting = ref(false);

const loadComments = async () => {
  isLoading.value = true;
  try {
    comments.value = await getComments(props.postId);
  } finally {
    isLoading.value = false;
  }
};

const handleSendComment = async () => {
  if (!newCommentText.value.trim()) return;

  isSubmitting.value = true;
  try {
    const offer = showOfferInput.value && offerPriceAmount.value && offerPriceAmount.value > 0
      ? offerPriceAmount.value
      : undefined;

    const added = await submitComment(props.postId, newCommentText.value.trim(), offer);
    comments.value.push(added);

    // Reset input
    newCommentText.value = '';
    offerPriceAmount.value = null;
    showOfferInput.value = false;
  } catch (err) {
    console.error('Failed to submit comment:', err);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadComments();
});
</script>

<template>
  <div class="bg-gray-50/80 border-t border-gray-100 p-4 sm:p-5 rounded-b-2xl space-y-4">
    <!-- Header of Comments Section -->
    <div class="flex items-center justify-between text-xs text-gray-500 font-semibold pb-1">
      <div class="flex items-center gap-1.5 text-gray-700">
        <MessageCircle class="w-4 h-4 text-orange-500" />
        <span>Bình luận & Trả giá ({{ comments.length }})</span>
      </div>
      <span class="text-[11px] text-gray-400">Trao đổi văn minh, rõ ràng</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-4 text-center text-xs text-gray-400">
      Đang tải trao đổi...
    </div>

    <!-- Empty Comments State -->
    <div v-else-if="comments.length === 0" class="py-4 text-center text-xs text-gray-400 italic">
      Chưa có bình luận nào. Hãy là người đầu tiên trả giá hoặc hỏi mua món này!
    </div>

    <!-- Comments List -->
    <div v-else class="space-y-3">
      <div
        v-for="cmt in comments"
        :key="cmt.id"
        class="flex items-start gap-2.5 text-xs group"
      >
        <img
          :src="cmt.authorAvatar"
          :alt="cmt.authorName"
          class="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 mt-0.5"
          loading="lazy"
        />

        <div class="flex-1 bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
          <div class="flex items-center justify-between gap-2">
            <span class="font-bold text-gray-900">{{ cmt.authorName }}</span>
            <span class="text-[10px] text-gray-400">{{ formatRelativeTime(cmt.createdAt) }}</span>
          </div>

          <!-- Highlight Offer Price Badge if present -->
          <div v-if="cmt.offerPrice" class="mt-1">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
              <DollarSign class="w-3.5 h-3.5 text-amber-600" />
              Đề xuất giá: {{ formatPrice(cmt.offerPrice) }}
            </span>
          </div>

          <p class="text-gray-700 mt-1 leading-relaxed">
            {{ cmt.content }}
          </p>
        </div>
      </div>
    </div>

    <!-- Input Box & Offer Price Form -->
    <div class="pt-2 border-t border-gray-200/60 space-y-2">
      <!-- Toggle Offer Price Button -->
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="showOfferInput = !showOfferInput"
          class="inline-flex items-center gap-1.5 text-[11px] font-semibold py-1 px-2.5 rounded-lg transition"
          :class="showOfferInput 
            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
            : 'text-gray-600 hover:text-amber-700 bg-white border border-gray-200 hover:bg-amber-50'"
        >
          <Tag class="w-3 h-3 text-amber-600" />
          <span>{{ showOfferInput ? '✕ Hủy mức giá đề xuất' : '+ Kèm mức giá đề xuất (Trả giá)' }}</span>
        </button>

        <span v-if="showOfferInput" class="text-[10px] text-amber-700 font-medium">
          Mức giá này sẽ được gắn nổi bật trên bình luận
        </span>
      </div>

      <!-- Offer Price Input (if toggled) -->
      <div v-if="showOfferInput" class="flex items-center gap-2 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 animate-fade-in">
        <span class="text-xs font-bold text-amber-800 shrink-0">Số tiền bạn muốn trả:</span>
        <div class="relative flex-1">
          <input
            v-model.number="offerPriceAmount"
            type="number"
            step="10000"
            min="0"
            placeholder="Ví dụ: 850000 (VNĐ)"
            class="w-full px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <span class="text-xs text-amber-700 font-semibold shrink-0">₫</span>
      </div>

      <!-- Comment Text Input & Submit Button -->
      <div class="flex items-center gap-2">
        <input
          v-model="newCommentText"
          @keyup.enter="handleSendComment"
          type="text"
          placeholder="Viết bình luận, hỏi thêm tình trạng đồ, thỏa thuận bốc hàng..."
          class="flex-1 px-4 py-2 text-xs border border-gray-300 rounded-xl bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
        />

        <button
          @click="handleSendComment"
          :disabled="!newCommentText.trim() || isSubmitting"
          class="inline-flex items-center justify-center p-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white shadow-xs transition active:scale-95 disabled:pointer-events-none shrink-0"
          title="Gửi bình luận"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
