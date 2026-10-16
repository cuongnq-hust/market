<script setup lang="ts">
import { ref } from 'vue';
import { X, Flag, ShieldAlert, Check } from 'lucide-vue-next';
import { useModeration } from '../../composables/useModeration';

const emit = defineEmits<{
  (e: 'reported', message: string): void;
}>();

const { reportingTarget, closeReportModal, reportPost } = useModeration();

const selectedReason = ref('scam');
const customNote = ref('');
const hideForMe = ref(true);
const isSubmitted = ref(false);

const reasons = [
  { key: 'scam', label: 'Lừa đảo / Yêu cầu chuyển cọc trước', desc: 'Có dấu hiệu chiếm đoạt tiền hoặc lừa đảo qua mạng' },
  { key: 'sold', label: 'Đã bán nhưng không gỡ tin', desc: 'Món đồ đã bán xong nhưng vẫn hiển thị làm phiền người mua' },
  { key: 'fake', label: 'Tin ảo / Số điện thoại rác', desc: 'Số điện thoại sai, không liên hệ được hoặc người đăng trêu đùa' },
  { key: 'prohibited', label: 'Hàng cấm / Vi phạm pháp luật', desc: 'Sản phẩm nằm trong danh mục cấm giao dịch' },
  { key: 'other', label: 'Lý do khác', desc: 'Nội dung phản cảm, sai lệch' },
];

const handleSubmit = () => {
  if (!reportingTarget.value) return;

  const result = reportPost(reportingTarget.value.id, selectedReason.value, hideForMe.value);
  isSubmitted.value = true;

  setTimeout(() => {
    isSubmitted.value = false;
    const msg = result.isAutoHidden
      ? 'Đã tiếp nhận báo cáo. Bài viết đã bị ẩn khỏi cộng đồng do nhận nhiều lượt báo cáo!'
      : 'Cảm ơn bạn! Đã gửi báo cáo và ẩn tin khỏi bảng tin của bạn.';
    emit('reported', msg);
    closeReportModal();
  }, 900);
};
</script>

<template>
  <div
    v-if="reportingTarget"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
  >
    <div
      class="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
    >
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-red-50 via-amber-50 to-white px-6 py-4 border-b border-red-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Flag class="w-5 h-5 fill-red-600" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">Báo cáo nội dung vi phạm</h3>
            <p class="text-[11px] text-gray-500 line-clamp-1">
              "{{ reportingTarget.title }}"
            </p>
          </div>
        </div>

        <button
          @click="closeReportModal"
          class="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center shadow-xs transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Success Screen -->
      <div v-if="isSubmitted" class="p-8 text-center space-y-2">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Check class="w-6 h-6 stroke-[3]" />
        </div>
        <h4 class="font-bold text-gray-900">Đã gửi báo cáo thành công</h4>
        <p class="text-xs text-gray-500">Hệ thống đang xử lý và bảo vệ trải nghiệm của bạn...</p>
      </div>

      <!-- Form Body -->
      <form v-else @submit.prevent="handleSubmit" class="p-6 space-y-4 text-xs sm:text-sm">
        <div>
          <label class="block font-bold text-gray-700 mb-2">
            Vui lòng chọn lý do vi phạm:
          </label>
          <div class="space-y-2">
            <label
              v-for="r in reasons"
              :key="r.key"
              class="flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer"
              :class="selectedReason === r.key
                ? 'border-red-500 bg-red-50/50 shadow-2xs'
                : 'border-gray-200 hover:bg-gray-50'"
            >
              <input
                v-model="selectedReason"
                type="radio"
                :value="r.key"
                class="mt-0.5 text-red-600 focus:ring-red-500"
              />
              <div class="flex-1">
                <div class="font-semibold text-gray-900 text-xs">{{ r.label }}</div>
                <div class="text-[11px] text-gray-500 mt-0.5">{{ r.desc }}</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Optional custom note -->
        <div>
          <label class="block font-semibold text-gray-600 mb-1 text-xs">
            Ghi chú thêm (không bắt buộc):
          </label>
          <input
            v-model="customNote"
            type="text"
            placeholder="Ví dụ: Người này đòi cọc 200k qua thẻ cào..."
            class="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 bg-gray-50/50 focus:bg-white"
          />
        </div>

        <!-- Checkbox: Hide for me -->
        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
          <input
            v-model="hideForMe"
            type="checkbox"
            class="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
          />
          <span class="text-xs font-semibold text-gray-700">
            Ẩn bài viết này khỏi bảng tin của tôi ngay lập tức
          </span>
        </label>

        <!-- Warning alert -->
        <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-800 text-[11px]">
          <ShieldAlert class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Quy tắc cộng đồng: Những bài đăng nhận từ 3 lượt báo cáo từ các thiết bị khác nhau sẽ tự động bị gỡ khỏi toàn bộ hệ thống.
          </span>
        </div>

        <!-- Submit & Cancel buttons -->
        <div class="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="closeReportModal"
            class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <Flag class="w-3.5 h-3.5 fill-white" />
            <span>Gửi báo cáo vi phạm</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
