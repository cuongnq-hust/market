import type { ProductCondition, ProductPrice, ProductStatus } from '../types/database';

/**
 * Format product price to Vietnamese representation:
 * - Number: 150000 -> "150.000 ₫"
 * - 'negotiable' -> "Thương lượng"
 * - 'free' -> "Tặng miễn phí 0₫"
 */
export function formatPrice(price: ProductPrice): string {
  if (price === 'free') {
    return 'Tặng miễn phí 0₫';
  }
  if (price === 'negotiable') {
    return 'Thương lượng';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatCondition(condition: ProductCondition): {
  label: string;
  badgeClass: string;
} {
  switch (condition) {
    case 'new':
      return {
        label: 'Mới 100%',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    case 'used':
      return {
        label: 'Đã dùng (Tốt)',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'scrap':
      return {
        label: 'Ve chai / Xác máy',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      };
  }
}

export function formatStatus(status: ProductStatus): {
  label: string;
  badgeClass: string;
} {
  if (status === 'available') {
    return {
      label: 'Còn hàng',
      badgeClass: 'bg-green-100 text-green-700',
    };
  }
  return {
    label: 'Đã thanh lý',
    badgeClass: 'bg-gray-100 text-gray-500 line-through',
  };
}

/**
 * Relative time formatter in Vietnamese
 * e.g., "Vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước"
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return 'Vừa xong';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'Vừa xong';
    }
    if (diffMin < 60) {
      return `${diffMin} phút trước`;
    }
    if (diffHour < 24) {
      return `${diffHour} giờ trước`;
    }
    if (diffDay < 30) {
      return `${diffDay} ngày trước`;
    }

    return date.toLocaleDateString('vi-VN');
  } catch {
    return 'Vừa xong';
  }
}
