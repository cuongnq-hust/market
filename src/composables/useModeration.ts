import { ref } from 'vue';

const HIDDEN_POSTS_KEY = 'passdo_hidden_posts_v1';
const REPORTED_POSTS_KEY = 'passdo_reported_posts_v1';

export interface ReportPayload {
  id: string;
  title: string;
  type: 'post' | 'seller';
}

const hiddenPostIds = ref<string[]>([]);
const reportedCounts = ref<Record<string, number>>({});
const reportingTarget = ref<ReportPayload | null>(null);

// Load from LocalStorage
const loadModerationData = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const rawHidden = localStorage.getItem(HIDDEN_POSTS_KEY);
    if (rawHidden) hiddenPostIds.value = JSON.parse(rawHidden);

    const rawReported = localStorage.getItem(REPORTED_POSTS_KEY);
    if (rawReported) reportedCounts.value = JSON.parse(rawReported);
  } catch (err) {
    console.warn('Lỗi đọc dữ liệu kiểm duyệt:', err);
  }
};

const saveModerationData = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(HIDDEN_POSTS_KEY, JSON.stringify(hiddenPostIds.value));
    localStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(reportedCounts.value));
  } catch (err) {
    console.warn('Lỗi lưu dữ liệu kiểm duyệt:', err);
  }
};

loadModerationData();

export function useModeration() {
  const isPostHidden = (id: string): boolean => {
    if (hiddenPostIds.value.includes(id)) return true;
    const count = reportedCounts.value[id] || 0;
    return count >= 3; // Ngưỡng tự động ẩn bài vi phạm cộng đồng (>= 3 lượt báo cáo)
  };

  const hidePost = (id: string) => {
    if (!hiddenPostIds.value.includes(id)) {
      hiddenPostIds.value.push(id);
      saveModerationData();
    }
  };

  const unhidePost = (id: string) => {
    hiddenPostIds.value = hiddenPostIds.value.filter((i) => i !== id);
    saveModerationData();
  };

  const reportPost = (id: string, reason: string, hideForMe = true) => {
    console.info(`[Moderation] Reported item ${id} for reason: ${reason}`);
    const current = reportedCounts.value[id] || 0;
    reportedCounts.value[id] = current + 1;

    if (hideForMe) {
      hidePost(id);
    }

    saveModerationData();
    return {
      success: true,
      newCount: reportedCounts.value[id],
      isAutoHidden: reportedCounts.value[id] >= 3,
    };
  };

  const openReportModal = (target: ReportPayload) => {
    reportingTarget.value = target;
  };

  const closeReportModal = () => {
    reportingTarget.value = null;
  };

  return {
    hiddenPostIds,
    reportedCounts,
    reportingTarget,
    isPostHidden,
    hidePost,
    unhidePost,
    reportPost,
    openReportModal,
    closeReportModal,
  };
}
