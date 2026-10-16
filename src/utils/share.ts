/**
 * Tiện ích hỗ trợ liên hệ và chia sẻ tin nhanh
 */

/**
 * Tạo tin nhắn mẫu 1 chạm cho người mua khi liên hệ qua Zalo / SMS
 */
export const generateContactMessage = (itemTitle: string, priceText?: string): string => {
  const priceInfo = priceText ? ` giá ${priceText}` : '';
  return `Chào bạn, mình thấy bạn đang pass món "${itemTitle}"${priceInfo} trên web Pass Đồ Gần Nhà, món này còn không bạn?`;
};

/**
 * Tự động sao chép tin nhắn mẫu vào clipboard và mở khung chat Zalo
 */
export const openZaloWithTemplate = async (phone?: string | null, templateMessage?: string): Promise<{ success: boolean; message: string }> => {
  if (!phone) {
    return { success: false, message: 'Người bán chưa cung cấp số Zalo.' };
  }

  // Làm sạch số điện thoại (chỉ giữ lại chữ số)
  const cleanPhone = phone.replace(/\D/g, '');

  if (templateMessage && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(templateMessage);
    } catch (err) {
      console.warn('Không thể sao chép vào bộ nhớ tạm:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.open(`https://zalo.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
  }

  return {
    success: true,
    message: templateMessage
      ? 'Đã sao chép tin nhắn mẫu! Đang mở Zalo để bạn dán và gửi...'
      : 'Đang mở Zalo...',
  };
};

/**
 * Chia sẻ tin đăng hoặc điểm bán qua Web Share API hoặc sao chép liên kết
 */
export const shareItem = async (data: {
  title: string;
  text: string;
  url: string;
}): Promise<{ status: 'shared' | 'copied' | 'failed'; message: string }> => {
  if (typeof window === 'undefined') {
    return { status: 'failed', message: 'Môi trường không hỗ trợ chia sẻ.' };
  }

  // 1. Thử dùng Web Share API (Safari iOS, Chrome Android, Edge, macOS)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return { status: 'shared', message: 'Đã mở bảng chia sẻ ứng dụng!' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { status: 'failed', message: 'Đã hủy chia sẻ.' };
      }
      console.warn('Web Share API gặp lỗi, chuyển sang sao chép link:', err);
    }
  }

  // 2. Dự phòng: Sao chép URL vào clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(data.url);
      return { status: 'copied', message: 'Đã sao chép liên kết vào bộ nhớ tạm! Bạn có thể dán vào Zalo/Facebook để chia sẻ.' };
    } catch (err) {
      console.error('Lỗi khi sao chép liên kết:', err);
    }
  }

  return { status: 'failed', message: 'Không thể chia sẻ hoặc sao chép liên kết trên thiết bị này.' };
};

/**
 * Tạo URL Deep link cho bài đăng Diễn đàn
 */
export const getPostShareUrl = (postId: string): string => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/community?post=${encodeURIComponent(postId)}`;
};

/**
 * Tạo URL Deep link cho điểm bán trên Bản đồ
 */
export const getSellerShareUrl = (sellerId: string): string => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/?seller=${encodeURIComponent(sellerId)}`;
};
