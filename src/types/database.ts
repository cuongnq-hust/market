export type UserRole = 'buyer' | 'seller' | 'both';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
}

export type ProductCategory = 
  | 'electronics'    // Điện tử, vi tính, điện thoại
  | 'appliances'     // Đồ gia dụng, máy giặt, quạt, tủ lạnh
  | 'furniture'      // Nội thất, bàn ghế, tủ gỗ
  | 'books'          // Sách cũ, giáo trình, truyện
  | 'scrap'          // Ve chai, phế liệu, xác linh kiện
  | 'baby'           // Đồ mẹ và bé
  | 'cafe'           // Đồ quán ăn, cafe, thanh lý cửa hàng
  | 'fashion'        // Thời trang, phụ kiện
  | 'other';         // Khác

export type SellerType = 'store' | 'individual'; // 'store': Vựa thu mua / Cửa hàng cố định, 'individual': Người bán đơn lẻ / Cá nhân pass đồ

export interface SellerProfile {
  userId: string;
  shopName: string;
  sellerType: SellerType;
  address: string;
  latitude: number;
  longitude: number;
  categories: ProductCategory[];
  openTime: string;  // e.g. "08:00"
  closeTime: string; // e.g. "21:00"
  isOpenNow: boolean;
  phone?: string;
  zalo?: string;
  rating?: number;
  isVerified?: boolean;
  description?: string;
  isSoldOut?: boolean; // Nếu người bán đơn lẻ đã bán hết đồ -> ẩn khỏi bản đồ
  createdAt?: string;
}

export type ProductPrice = number | 'negotiable' | 'free';
export type ProductCondition = 'new' | 'used' | 'scrap';
export type ProductStatus = 'available' | 'sold';

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: ProductPrice;
  condition: ProductCondition;
  images: string[];
  status: ProductStatus;
  createdAt: string;
  isMyItem?: boolean; // Đánh dấu món đồ do chính người dùng hiện tại đăng bán
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface SellerWithDistance extends SellerProfile {
  distanceKm: number;
  user?: User;
  productsCount?: number;
}

export interface ProductWithSeller extends Product {
  seller: SellerProfile;
  sellerUser?: User;
  distanceKm?: number;
}

export interface FilterState {
  searchQuery: string;
  category: ProductCategory | 'all';
  radiusKm: number;
  onlyOpenNow: boolean;
  sellerType: 'all' | 'store' | 'individual'; // Lọc theo vựa thu mua hoặc người bán đơn lẻ
}

// ==========================================
// PHASE 2: COMMUNITY HUB (DIỄN ĐÀN CỘNG ĐỒNG)
// ==========================================

export type ForumPostType = 'sell' | 'buy'; // 'sell' = Cần Bán / Thanh Lý Gấp, 'buy' = Tìm Mua / Gom Hàng

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  offerPrice?: number; // Mức giá trả / thương lượng (nếu có)
  createdAt: string;
}

export interface ForumPost {
  id: string;
  type: ForumPostType;
  title: string;
  content: string;
  category: ProductCategory;
  price: ProductPrice;
  images: string[];
  district: string; // Quận/Huyện
  city: string;     // Tỉnh/Thành phố
  author: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    zalo?: string;
    role: UserRole;
  };
  isUrgent?: boolean; // Thanh lý gấp trong ngày
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  createdAt: string;
}

export interface ForumFilterState {
  postType: ForumPostType;
  district: string; // 'all' | string
  category: ProductCategory | 'all';
  searchQuery: string;
}
