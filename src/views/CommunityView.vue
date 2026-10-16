<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useForum } from '../composables/useForum';
import CommunityHeader from '../components/community/CommunityHeader.vue';
import CommunityFilters from '../components/community/CommunityFilters.vue';
import PostCard from '../components/community/PostCard.vue';
import CreatePostModal from '../components/community/CreatePostModal.vue';
import { MessageSquareDashed, Plus, Sparkles, ArrowUp } from 'lucide-vue-next';

const route = useRoute();

const {
  posts,
  isLoading,
  isCreateModalOpen,
  forumFilters,
  hasNewPostsNotification,
  newPostsCount,
  loadPendingPosts,
  hasMore,
  isLoadingMore,
  loadMorePosts,
} = useForum();

const scrollContainer = ref<HTMLDivElement | null>(null);
const loadMoreTrigger = ref<HTMLDivElement | null>(null);
let observer: IntersectionObserver | null = null;

// Tự động cuộn đến bài viết và làm nổi bật nếu mở từ liên kết chia sẻ (Deep Link: ?post=xxx)
const scrollToPostIfTargeted = () => {
  const targetId = route.query.post as string | undefined;
  if (!targetId) return;

  setTimeout(() => {
    const el = document.getElementById(`post-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-orange-500', 'transition-all', 'duration-500');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-orange-500');
      }, 3500);
    }
  }, 450);
};

watch(
  () => posts.value.length,
  () => {
    scrollToPostIfTargeted();
  },
  { immediate: true }
);

const setupObserver = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore.value && !isLoading.value && !isLoadingMore.value) {
        loadMorePosts();
      }
    },
    {
      root: scrollContainer.value,
      rootMargin: '250px', // Tự động load trước 250px khi lướt gần tới đáy
      threshold: 0.1,
    }
  );

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
};

watch(loadMoreTrigger, (el) => {
  if (el && observer) {
    observer.observe(el);
  }
});

onMounted(() => {
  setupObserver();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

const handleLoadNewPosts = () => {
  loadPendingPosts();
  scrollContainer.value?.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetFilters = () => {
  forumFilters.searchQuery = '';
  forumFilters.district = 'all';
  forumFilters.category = 'all';
};
</script>

<template>
  <div
    ref="scrollContainer"
    class="h-[calc(100vh-64px)] flex-1 flex flex-col bg-gradient-to-b from-[#f0f6fc] via-[#edf4fa] to-[#f4f8fd] overflow-y-auto scroll-smooth"
  >
    <!-- Community Top Header with Tabs -->
    <CommunityHeader />

    <!-- Filters Bar (District, Category, Search) -->
    <CommunityFilters />

    <!-- Feed Content Stream -->
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5 relative">
      <!-- Floating New Posts Notification Pill (Twitter/Facebook/Threads style) -->
      <transition
        enter-active-class="transition duration-300 ease-out transform"
        enter-from-class="-translate-y-4 opacity-0 scale-95"
        enter-to-class="translate-y-0 opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in transform"
        leave-from-class="translate-y-0 opacity-100 scale-100"
        leave-to-class="-translate-y-4 opacity-0 scale-95"
      >
        <div
          v-if="hasNewPostsNotification"
          class="sticky top-2 z-30 flex justify-center pointer-events-none mb-3"
        >
          <button
            type="button"
            @click="handleLoadNewPosts"
            class="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-blue-500/25 transition active:scale-95 cursor-pointer border-2 border-white ring-2 ring-blue-400/30"
          >
            <Sparkles class="w-4 h-4 text-sky-200 animate-pulse" />
            <span>Có {{ newPostsCount }} tin mới đăng · Bấm để xem</span>
            <ArrowUp class="w-3.5 h-3.5" />
          </button>
        </div>
      </transition>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-20 text-center text-slate-500">
        <div class="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs sm:text-sm font-medium">Đang tải tin đăng diễn đàn...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="posts.length === 0"
        class="bg-white/95 rounded-3xl border border-blue-100 p-10 sm:p-14 text-center shadow-[0_4px_20px_rgba(37,99,235,0.05)] space-y-4"
      >
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <MessageSquareDashed class="w-8 h-8" />
        </div>

        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-800">
            Không có bài đăng nào trong mục này
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Không tìm thấy tin phù hợp với bộ lọc hiện tại, hoặc chưa có ai đăng bài. Hãy là người đầu tiên đăng tin!
          </p>
        </div>

        <div class="flex items-center justify-center gap-2 pt-2">
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200/80 transition cursor-pointer"
          >
            Xóa bộ lọc
          </button>

          <button
            @click="isCreateModalOpen = true"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Đăng tin ngay</span>
          </button>
        </div>
      </div>

      <!-- Posts Feed Stream -->
      <div v-else class="space-y-4 pb-12">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />

        <!-- Infinite Scroll Sentinel & Loading More Indicator -->
        <div ref="loadMoreTrigger" class="py-6 flex flex-col items-center justify-center">
          <!-- Đang tải thêm trang tiếp theo -->
          <div
            v-if="isLoadingMore"
            class="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-blue-100 text-slate-600 text-xs font-semibold shadow-xs"
          >
            <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Đang tải thêm tin đăng...</span>
          </div>

          <!-- Đã xem hết toàn bộ bài viết -->
          <div
            v-else-if="!hasMore && posts.length > 0"
            class="text-xs text-slate-400 py-3 flex items-center gap-1.5 font-medium"
          >
            <span>✨</span>
            <span>Bạn đã xem hết toàn bộ bài đăng</span>
          </div>

          <!-- Nút bấm dự phòng nếu người dùng muốn bấm trực tiếp -->
          <button
            v-else-if="hasMore && !isLoadingMore"
            type="button"
            @click="loadMorePosts"
            class="px-4 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50 border border-blue-100 rounded-xl transition shadow-2xs cursor-pointer"
          >
            Lướt để tải thêm hoặc bấm vào đây
          </button>
        </div>
      </div>
    </main>

    <!-- Create Post Modal -->
    <CreatePostModal
      v-if="isCreateModalOpen"
      @close="isCreateModalOpen = false"
    />
  </div>
</template>
