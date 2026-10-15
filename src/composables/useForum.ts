import { ref, reactive, watch } from 'vue';
import type {
  ForumComment,
  ForumFilterState,
  ForumPost,
  ForumPostType,
} from '../types/database';
import { dataService } from '../services';

// Module-level global reactive state
const forumFilters = reactive<ForumFilterState>({
  postType: 'sell', // Default: Cần Bán / Thanh Lý Gấp
  district: 'all',
  category: 'all',
  searchQuery: '',
});

const posts = ref<ForumPost[]>([]);
const isLoading = ref(false);
const isCreateModalOpen = ref(false);

// Fetch function
const fetchPosts = async () => {
  isLoading.value = true;
  try {
    posts.value = await dataService.getForumPosts(forumFilters);
  } catch (err) {
    console.error('Error fetching forum posts:', err);
  } finally {
    isLoading.value = false;
  }
};

// Global watcher: declared ONCE at module level to prevent infinite recursive loops
watch(
  [
    () => forumFilters.postType,
    () => forumFilters.district,
    () => forumFilters.category,
    () => forumFilters.searchQuery,
  ],
  () => {
    fetchPosts();
  },
  { immediate: true }
);

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

    return comment;
  };

  const createPost = async (
    postData: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>
  ): Promise<ForumPost> => {
    const newPost = await dataService.createForumPost(postData);
    if (forumFilters.postType === newPost.type) {
      posts.value.unshift(newPost);
    }
    return newPost;
  };

  return {
    forumFilters,
    posts,
    isLoading,
    isCreateModalOpen,
    fetchPosts,
    setPostType,
    handleToggleLike,
    getComments,
    submitComment,
    createPost,
  };
}
