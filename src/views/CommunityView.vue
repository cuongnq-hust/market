<script setup lang="ts">
import { useForum } from '../composables/useForum';
import CommunityHeader from '../components/community/CommunityHeader.vue';
import CommunityFilters from '../components/community/CommunityFilters.vue';
import PostCard from '../components/community/PostCard.vue';
import CreatePostModal from '../components/community/CreatePostModal.vue';
import { MessageSquareDashed, Plus } from 'lucide-vue-next';

const { posts, isLoading, isCreateModalOpen, forumFilters } = useForum();

const resetFilters = () => {
  forumFilters.searchQuery = '';
  forumFilters.district = 'all';
  forumFilters.category = 'all';
};
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex-1 flex flex-col bg-gray-50/70 overflow-y-auto">
    <!-- Community Top Header with Tabs -->
    <CommunityHeader />

    <!-- Filters Bar (District, Category, Search) -->
    <CommunityFilters />

    <!-- Feed Content Stream -->
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-20 text-center text-gray-500">
        <div class="w-9 h-9 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs sm:text-sm font-medium">Đang tải tin đăng diễn đàn...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="posts.length === 0"
        class="bg-white rounded-3xl border border-gray-200 p-10 sm:p-14 text-center shadow-xs space-y-4"
      >
        <div class="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
          <MessageSquareDashed class="w-8 h-8" />
        </div>

        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-800">
            Không có bài đăng nào trong mục này
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
            Không tìm thấy tin phù hợp với bộ lọc hiện tại, hoặc chưa có ai đăng bài. Hãy là người đầu tiên đăng tin!
          </p>
        </div>

        <div class="flex items-center justify-center gap-2 pt-2">
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
          >
            Xóa bộ lọc
          </button>

          <button
            @click="isCreateModalOpen = true"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95"
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
      </div>
    </main>

    <!-- Create Post Modal -->
    <CreatePostModal
      v-if="isCreateModalOpen"
      @close="isCreateModalOpen = false"
    />
  </div>
</template>
