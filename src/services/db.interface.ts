import type {
  FilterState,
  ForumComment,
  ForumFilterState,
  ForumPost,
  GeoLocation,
  Product,
  ProductWithSeller,
  SellerProfile,
  SellerWithDistance,
  User,
} from '../types/database';

export interface IDataService {
  // Users & Sellers
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;

  getSellers(): Promise<SellerProfile[]>;
  getSellerById(userId: string): Promise<SellerProfile | null>;
  getNearbySellers(
    userLocation: GeoLocation,
    filters: FilterState
  ): Promise<SellerWithDistance[]>;

  registerSeller(
    sellerData: Omit<SellerProfile, 'isSoldOut'>,
    initialProduct?: Omit<Product, 'id' | 'sellerId' | 'status' | 'createdAt'>
  ): Promise<{ seller: SellerProfile; product?: Product }>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductsBySellerId(sellerId: string): Promise<Product[]>;
  getNearbyProducts(
    userLocation: GeoLocation,
    filters: FilterState
  ): Promise<ProductWithSeller[]>;

  addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  markProductAsSold(productId: string): Promise<boolean>;
  markProductAsAvailable(productId: string): Promise<boolean>;
  getMyProducts(): Promise<Product[]>;

  // Phase 2: Community Forum Hub
  getForumPosts(filters: ForumFilterState): Promise<ForumPost[]>;
  getForumPostById(id: string): Promise<ForumPost | null>;
  createForumPost(
    postData: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>
  ): Promise<ForumPost>;
  getPostComments(postId: string): Promise<ForumComment[]>;
  addPostComment(
    commentData: Omit<ForumComment, 'id' | 'createdAt'>
  ): Promise<ForumComment>;
  toggleLikePost(postId: string): Promise<boolean>;
}
