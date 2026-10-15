import type { GeoLocation, ProductCategory } from '../types/database';

// Default center coordinates: Hoan Kiem Lake, Hanoi
export const DEFAULT_HANOI_COORDINATES: GeoLocation = {
  latitude: 21.028511,
  longitude: 105.854167,
};

export interface CategoryMeta {
  key: ProductCategory;
  label: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'electronics',
    label: 'Điện tử & Máy tính',
    iconName: 'Laptop',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800'
  },
  {
    key: 'appliances',
    label: 'Đồ gia dụng',
    iconName: 'Tv',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800'
  },
  {
    key: 'furniture',
    label: 'Nội thất & Bàn ghế',
    iconName: 'Armchair',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800'
  },
  {
    key: 'scrap',
    label: 'Ve chai & Phế liệu',
    iconName: 'Recycle',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800'
  },
  {
    key: 'books',
    label: 'Sách & Truyện cũ',
    iconName: 'BookOpen',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800'
  },
  {
    key: 'baby',
    label: 'Đồ Mẹ & Bé',
    iconName: 'Baby',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-800'
  },
  {
    key: 'cafe',
    label: 'Thanh lý Quán cafe',
    iconName: 'Coffee',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800'
  },
  {
    key: 'fashion',
    label: 'Quần áo & Phụ kiện',
    iconName: 'Shirt',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800'
  },
  {
    key: 'other',
    label: 'Khác',
    iconName: 'Package',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-800'
  }
];

export const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
];

export const HANOI_DISTRICTS = [
  'Cầu Giấy',
  'Đống Đa',
  'Hoàn Kiếm',
  'Ba Đình',
  'Hai Bà Trưng',
  'Tây Hồ',
  'Thanh Xuân',
  'Hà Đông',
  'Hoàng Mai',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Long Biên',
  'Gia Lâm',
];
