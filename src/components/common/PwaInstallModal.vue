<script setup lang="ts">
import { X, Smartphone, Share2, PlusSquare, Sparkles } from 'lucide-vue-next';
import { usePwaInstall } from '../../composables/usePwaInstall';

const { showIosModal, promptInstall, canInstall } = usePwaInstall();
</script>

<template>
  <div
    v-if="showIosModal"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
  >
    <div
      class="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-6 text-center"
    >
      <button
        @click="showIosModal = false"
        class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- App Icon Header -->
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
        <Sparkles class="w-8 h-8" />
      </div>

      <h3 class="text-lg font-black text-slate-900">
        Cài đặt Pass Đồ Gần Nhà
      </h3>
      <p class="text-xs text-slate-500 mt-1 mb-5">
        Mở toàn màn hình, tải siêu nhanh và không cần nhập địa chỉ web mỗi lần vào
      </p>

      <!-- If direct install available (Chrome/Android/Edge) -->
      <div v-if="canInstall" class="mb-4">
        <button
          @click="promptInstall(); showIosModal = false"
          class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          📲 Bấm để cài đặt ứng dụng ngay
        </button>
      </div>

      <!-- iOS Safari Instructions -->
      <div v-else class="text-left bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-3 text-xs text-slate-700">
        <div class="font-bold text-blue-900 flex items-center gap-1.5">
          <Smartphone class="w-4 h-4 text-blue-600" />
          <span>Hướng dẫn cài đặt trên iPhone / iPad (Safari):</span>
        </div>

        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
          <p>
            Bấm vào nút <strong>Chia sẻ (Share)</strong>
            <Share2 class="w-3.5 h-3.5 inline mx-0.5 text-blue-600" />
            ở thanh công cụ dưới cùng của trình duyệt Safari.
          </p>
        </div>

        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
          <p>
            Cuộn xuống danh sách tùy chọn và bấm <strong>"Thêm vào Màn hình chính"</strong> (Add to Home Screen)
            <PlusSquare class="w-3.5 h-3.5 inline mx-0.5 text-gray-700" />.
          </p>
        </div>

        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
          <p>
            Bấm <strong>"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất.
          </p>
        </div>
      </div>

      <button
        @click="showIosModal = false"
        class="mt-5 w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
      >
        Đã hiểu, đóng lại
      </button>
    </div>
  </div>
</template>
