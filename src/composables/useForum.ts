import { ref, reactive, watch, computed } from 'vue';
import type {
  ForumComment,
  ForumFilterState,
  ForumPost,
  ForumPostType,
} from '../types/database';
import { dataService, onPostsSync, broadcastSyncEvent } from '../services';

// Module-level global reactive state
const forumFilters = reactive<ForumFilterState>({
  postType: 'sell', // Default: Cần Bán / Thanh Lý Gấp
  district: 'all',
  category: 'all',
  searchQuery: '',
  priceRange: 'all',
  sortBy: 'newest',
});

const posts = ref<ForumPost[]>([]);
const isLoading = ref(false);
const isCreateModalOpen = ref(false);

// Infinite Scroll Pagination State
const PAGE_SIZE = 8;
const currentPage = ref(1);
const hasMore = ref(true);
const isLoadingMore = ref(false);

// Tin đăng mới từ các máy khác trong lúc người dùng đang lướt
const pendingNewPosts = ref<ForumPost[]>([]);
const hasNewPostsNotification = computed(() => pendingNewPosts.value.length > 0);
const newPostsCount = computed(() => pendingNewPosts.value.length);

const loadPendingPosts = () => {
  if (pendingNewPosts.value.length > 0) {
    posts.value = [...pendingNewPosts.value, ...posts.value];
    pendingNewPosts.value = [];
  }
};

// Fetch function supporting silent background update & first page loading
const fetchPosts = async (options?: { isSilent?: boolean }) => {
  const isSilent = Boolean(options?.isSilent);
  if (!isSilent) {
    isLoading.value = true;
    currentPage.value = 1;
    hasMore.value = true;
  }
  try {
    const fetched = await dataService.getForumPosts(forumFilters, {
      page: 1,
      pageSize: PAGE_SIZE,
    });

    if (!isSilent) {
      posts.value = fetched;
      pendingNewPosts.value = [];
      hasMore.value = fetched.length >= PAGE_SIZE;
    } else {
      // SILENT REALTIME SYNC (Không giật màn hình, không làm văng tin người dùng đang đọc)
      const existingIds = new Set(posts.value.map((p) => p.id));
      const pendingIds = new Set(pendingNewPosts.value.map((p) => p.id));

      // 1. Tin mới hoàn toàn từ máy khác -> Đưa vào danh sách chờ để hiện nút nổi
      const brandNew = fetched.filter((p) => !existingIds.has(p.id) && !pendingIds.has(p.id));
      if (brandNew.length > 0) {
        pendingNewPosts.value = [...brandNew, ...pendingNewPosts.value];
      }

      // 2. Cập nhật tại chỗ (In-Place) cho bài viết cũ (trạng thái Đã bán, lượt thích, bình luận)
      fetched.forEach((newP) => {
        const existing = posts.value.find((p) => p.id === newP.id);
        if (existing) {
          if (existing.status !== newP.status) existing.status = newP.status;
          if (existing.likesCount !== newP.likesCount) existing.likesCount = newP.likesCount;
          if (existing.commentsCount !== newP.commentsCount) existing.commentsCount = newP.commentsCount;
        }
      });

      // 3. Nếu tin đã bị xóa khỏi DB -> Lọc bỏ êm ái
      const fetchedIds = new Set(fetched.map((f) => f.id));
      posts.value = posts.value.filter((p) => fetchedIds.has(p.id));
    }
  } catch (err) {
    console.error('Error fetching forum posts:', err);
  } finally {
    if (!isSilent) {
      isLoading.value = false;
    }
  }
};

// Infinite Scroll: Tải thêm bài khi lướt tới cuối danh sách
const loadMorePosts = async () => {
  if (isLoadingMore.value || isLoading.value || !hasMore.value) return;

  isLoadingMore.value = true;
  const nextPage = currentPage.value + 1;

  try {
    const nextPosts = await dataService.getForumPosts(forumFilters, {
      page: nextPage,
      pageSize: PAGE_SIZE,
    });

    if (nextPosts.length < PAGE_SIZE) {
      hasMore.value = false;
    }

    if (nextPosts.length > 0) {
      currentPage.value = nextPage;
      // Tránh trùng lặp ID (phòng trường hợp có tin mới đẩy lên đầu)
      const existingIds = new Set(posts.value.map((p) => p.id));
      const uniqueNext = nextPosts.filter((p) => !existingIds.has(p.id));
      posts.value = [...posts.value, ...uniqueNext];
    }
  } catch (err) {
    console.error('Error loading more forum posts:', err);
  } finally {
    isLoadingMore.value = false;
  }
};

// Global watcher khi người dùng chủ động chọn tab / đổi bộ lọc
watch(
  [
    () => forumFilters.postType,
    () => forumFilters.district,
    () => forumFilters.category,
    () => forumFilters.searchQuery,
    () => forumFilters.priceRange,
    () => forumFilters.sortBy,
  ],
  () => {
    fetchPosts({ isSilent: false });
  },
  { immediate: true }
);

// Auto-sync across devices (Realtime) & cross tabs (Broadcast) - Luôn đồng bộ êm ngầm (isSilent: true)
onPostsSync(async (options) => {
  await fetchPosts({ isSilent: options?.isSilent ?? true });
});

export function useForum() {
  const setPostType = (type: ForumPostType) => {
    forumFilters.postType = type;
  };

  const handleToggleLike = async (postId: string) => {
    try {
      await dataService.toggleLikePost(postId);
      const post = posts.value.find((p) => p.id === postId);
      if (post) {
        if (post.isLiked) {
          post.isLiked = false;
          post.likesCount = Math.max(0, post.likesCount - 1);
        } else {
          post.isLiked = true;
          post.likesCount += 1;
        }
      }
      broadcastSyncEvent('POSTS_CHANGED');
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const getComments = async (postId: string): Promise<ForumComment[]> => {
    return dataService.getPostComments(postId);
  };

  const submitComment = async (
    postId: string,
    content: string,
    offerPrice?: number
  ): Promise<ForumComment> => {
    const comment = await dataService.addPostComment({
      postId,
      authorId: 'my-user',
      authorName: 'Bạn (Người dùng)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      content,
      offerPrice,
    });

    const post = posts.value.find((p) => p.id === postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
    }

    broadcastSyncEvent('POSTS_CHANGED');
    return comment;
  };

  const createPost = async (
    postData: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>
  ): Promise<ForumPost> => {
    const newPost = await dataService.createForumPost(postData);
    if (forumFilters.postType === newPost.type) {
      posts.value.unshift(newPost);
    }
    broadcastSyncEvent('POSTS_CHANGED');
    return newPost;
  };

  const deletePost = async (postId: string) => {
    const success = await dataService.deleteForumPost(postId);
    if (success) {
      posts.value = posts.value.filter((p) => p.id !== postId);
      broadcastSyncEvent('POSTS_CHANGED');
    }
    return success;
  };

  const markPostAsSold = async (postId: string) => {
    const success = await dataService.markForumPostAsSold(postId);
    if (success) {
      const p = posts.value.find((item) => item.id === postId);
      if (p) p.status = 'sold';
      broadcastSyncEvent('POSTS_CHANGED');
    }
    return success;
  };

  return {
    forumFilters,
    posts,
    isLoading,
    isCreateModalOpen,
    pendingNewPosts,
    hasNewPostsNotification,
    newPostsCount,
    loadPendingPosts,
    hasMore,
    isLoadingMore,
    loadMorePosts,
    fetchPosts,
    setPostType,
    handleToggleLike,
    getComments,
    submitComment,
    createPost,
    deletePost,
    markPostAsSold,
  };
}
