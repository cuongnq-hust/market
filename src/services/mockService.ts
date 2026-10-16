import type { IDataService } from './db.interface';
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
  PaginationParams,
} from '../types/database';
import { MOCK_USERS } from '../mock/users';
import { MOCK_SELLERS } from '../mock/sellers';
import { MOCK_PRODUCTS } from '../mock/products';
import { MOCK_FORUM_POSTS } from '../mock/forumPosts';
import { MOCK_FORUM_COMMENTS } from '../mock/forumComments';
import { calculateDistanceKm, isWithinRadius } from '../utils/geo';
import { getAnonymousDeviceId } from '../utils/deviceSession';

class MockDataService implements IDataService {
  private users: User[] = [...MOCK_USERS];
  private sellers: SellerProfile[] = [...MOCK_SELLERS];
  private products: Product[] = [...MOCK_PRODUCTS];
  private forumPosts: ForumPost[] = [...MOCK_FORUM_POSTS];
  private forumComments: ForumComment[] = [...MOCK_FORUM_COMMENTS];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedSellers = localStorage.getItem('passdo_sellers');
      if (storedSellers) {
        this.sellers = JSON.parse(storedSellers);
      }

      const storedProducts = localStorage.getItem('passdo_products');
      if (storedProducts) {
        this.products = JSON.parse(storedProducts);
      }

      const storedPosts = localStorage.getItem('passdo_forum_posts');
      if (storedPosts) {
        this.forumPosts = JSON.parse(storedPosts);
      }

      const storedComments = localStorage.getItem('passdo_forum_comments');
      if (storedComments) {
        this.forumComments = JSON.parse(storedComments);
      }
    } catch {
      // Fallback in non-browser environment
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('passdo_sellers', JSON.stringify(this.sellers));
      localStorage.setItem('passdo_products', JSON.stringify(this.products));
      localStorage.setItem('passdo_forum_posts', JSON.stringify(this.forumPosts));
      localStorage.setItem('passdo_forum_comments', JSON.stringify(this.forumComments));
    } catch {
      // ignore
    }
  }

  // ================= USERS & SELLERS =================
  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async getSellers(): Promise<SellerProfile[]> {
    return [...this.sellers];
  }

  async getSellerById(userId: string): Promise<SellerProfile | null> {
    return this.sellers.find((s) => s.userId === userId) || null;
  }

  async registerSeller(
    sellerData: Omit<SellerProfile, 'isSoldOut'>,
    initialProduct?: Omit<Product, 'id' | 'sellerId' | 'status' | 'createdAt'>
  ): Promise<{ seller: SellerProfile; product?: Product }> {
    const newSeller: SellerProfile = {
      ...sellerData,
      isSoldOut: false,
      createdAt: new Date().toISOString(),
    };

    // Replace if exists or add new
    const existingIndex = this.sellers.findIndex((s) => s.userId === newSeller.userId);
    if (existingIndex >= 0) {
      this.sellers[existingIndex] = newSeller;
    } else {
      this.sellers.unshift(newSeller);
    }

    let createdProduct: Product | undefined;
    if (initialProduct) {
      createdProduct = {
        ...initialProduct,
        id: `prod-${Date.now()}`,
        sellerId: newSeller.userId,
        status: 'available',
        createdAt: new Date().toISOString(),
        isMyItem: true,
      };
      this.products.unshift(createdProduct);
    }

    this.saveToStorage();
    return { seller: newSeller, product: createdProduct };
  }

  async getNearbySellers(
    userLocation: GeoLocation,
    filters: FilterState
  ): Promise<SellerWithDistance[]> {
    const query = filters.searchQuery.trim().toLowerCase();

    // 1. Calculate distance & available products count for each seller
    const sellersWithDist: SellerWithDistance[] = this.sellers.map((seller) => {
      const distanceKm = calculateDistanceKm(userLocation, {
        latitude: seller.latitude,
        longitude: seller.longitude,
      });
      const user = this.users.find((u) => u.id === seller.userId);

      // Only count AVAILABLE products
      const availableProducts = this.products.filter(
        (p) => p.sellerId === seller.userId && p.status === 'available'
      );

      return {
        ...seller,
        distanceKm,
        user,
        productsCount: availableProducts.length,
      };
    });

    // 2. Apply filters
    const filtered = sellersWithDist.filter((seller) => {
      // RULE: For individual sellers ('individual'), if all items are sold out (0 available products),
      // DO NOT SHOW on the map / list!
      if (seller.sellerType === 'individual') {
        if (seller.isSoldOut || (seller.productsCount ?? 0) === 0) {
          return false;
        }
      }

      // Filter by sellerType ('all' | 'store' | 'individual')
      if (filters.sellerType && filters.sellerType !== 'all') {
        if (seller.sellerType !== filters.sellerType) {
          return false;
        }
      }

      // Check radius
      if (!isWithinRadius(userLocation, { latitude: seller.latitude, longitude: seller.longitude }, filters.radiusKm)) {
        return false;
      }

      // Check open status if toggled
      if (filters.onlyOpenNow && !seller.isOpenNow) {
        return false;
      }

      // Check category
      if (filters.category !== 'all' && !seller.categories.includes(filters.category)) {
        return false;
      }

      // Check search query
      if (query) {
        const matchesShop =
          seller.shopName.toLowerCase().includes(query) ||
          seller.address.toLowerCase().includes(query) ||
          (seller.description && seller.description.toLowerCase().includes(query));

        const sellerProducts = this.products.filter(
          (p) => p.sellerId === seller.userId && p.status === 'available'
        );
        const matchesProduct = sellerProducts.some(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );

        if (!matchesShop && !matchesProduct) {
          return false;
        }
      }

      // Price range / Free gift filter
      if (filters.priceRange && filters.priceRange !== 'all') {
        const sellerProducts = this.products.filter(
          (p) => p.sellerId === seller.userId && p.status === 'available'
        );
        const hasMatchingProduct = sellerProducts.some((p) => {
          if (filters.priceRange === 'free') return p.price === 'free' || p.price === 0;
          if (filters.priceRange === 'negotiable') return p.price === 'negotiable';
          if (typeof p.price === 'number') {
            if (filters.priceRange === 'under_100k') return p.price > 0 && p.price <= 100000;
            if (filters.priceRange === '100k_500k') return p.price > 100000 && p.price <= 500000;
            if (filters.priceRange === 'over_1m') return p.price >= 1000000;
          }
          return false;
        });
        if (!hasMatchingProduct) return false;
      }

      return true;
    });

    // 3. Sort ascending by distance (closest first)
    return filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // ================= PRODUCTS =================
  async getProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) || null;
  }

  async getProductsBySellerId(sellerId: string): Promise<Product[]> {
    return this.products.filter((p) => p.sellerId === sellerId);
  }

  async getMyProducts(): Promise<Product[]> {
    return this.products.filter((p) => p.isMyItem || p.sellerId.startsWith('my-'));
  }

  async getNearbyProducts(
    userLocation: GeoLocation,
    filters: FilterState
  ): Promise<ProductWithSeller[]> {
    const query = filters.searchQuery.trim().toLowerCase();
    const result: ProductWithSeller[] = [];

    for (const product of this.products) {
      // RULE: Do not show sold products!
      if (product.status === 'sold') {
        continue;
      }

      const seller = this.sellers.find((s) => s.userId === product.sellerId);
      if (!seller) continue;

      // Filter out individual sellers that are marked sold out
      if (seller.sellerType === 'individual' && seller.isSoldOut) {
        continue;
      }

      // Filter by sellerType
      if (filters.sellerType && filters.sellerType !== 'all') {
        if (seller.sellerType !== filters.sellerType) {
          continue;
        }
      }

      const sellerUser = this.users.find((u) => u.id === seller.userId);
      const distanceKm = calculateDistanceKm(userLocation, {
        latitude: seller.latitude,
        longitude: seller.longitude,
      });

      if (distanceKm > filters.radiusKm) continue;
      if (filters.onlyOpenNow && !seller.isOpenNow) continue;
      if (filters.category !== 'all' && product.category !== filters.category) continue;

      // Price range / Free gift filter
      if (filters.priceRange && filters.priceRange !== 'all') {
        if (filters.priceRange === 'free' && !(product.price === 'free' || product.price === 0)) continue;
        if (filters.priceRange === 'negotiable' && product.price !== 'negotiable') continue;
        if (typeof product.price === 'number') {
          if (filters.priceRange === 'under_100k' && !(product.price > 0 && product.price <= 100000)) continue;
          if (filters.priceRange === '100k_500k' && !(product.price > 100000 && product.price <= 500000)) continue;
          if (filters.priceRange === 'over_1m' && !(product.price >= 1000000)) continue;
        } else if (filters.priceRange !== 'free' && filters.priceRange !== 'negotiable') {
          continue;
        }
      }

      if (query) {
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesShop = seller.shopName.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesShop) continue;
      }

      result.push({
        ...product,
        seller,
        sellerUser,
        distanceKm,
      });
    }

    return result.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  async addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.products.unshift(newProduct);
    this.saveToStorage();
    return newProduct;
  }

  async markProductAsSold(productId: string): Promise<boolean> {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return false;

    product.status = 'sold';

    // Check if seller is individual: if all products sold, mark seller isSoldOut
    const seller = this.sellers.find((s) => s.userId === product.sellerId);
    if (seller && seller.sellerType === 'individual') {
      const remainingAvailable = this.products.filter(
        (p) => p.sellerId === seller.userId && p.status === 'available'
      );
      if (remainingAvailable.length === 0) {
        seller.isSoldOut = true;
      }
    }

    this.saveToStorage();
    return true;
  }

  async markProductAsAvailable(productId: string): Promise<boolean> {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return false;

    product.status = 'available';

    const seller = this.sellers.find((s) => s.userId === product.sellerId);
    if (seller) {
      seller.isSoldOut = false;
    }

    this.saveToStorage();
    return true;
  }

  // ================= PHASE 2: COMMUNITY FORUM HUB =================
  async getForumPosts(
    filters: ForumFilterState,
    pagination?: PaginationParams
  ): Promise<ForumPost[]> {
    const query = filters.searchQuery.trim().toLowerCase();
    const currentDeviceId = getAnonymousDeviceId();
    const now = Date.now();

    const filtered = this.forumPosts.filter((post) => {
      // 1. Auto-expire: Hide posts past expiration (unless it's my post)
      if (post.expiresAt && new Date(post.expiresAt).getTime() < now) {
        if (post.author.id !== currentDeviceId) return false;
      }

      // 2. Hide sold out posts (unless it's my post)
      if (post.status === 'sold') {
        if (post.author.id !== currentDeviceId) return false;
      }

      if (post.type !== filters.postType) {
        return false;
      }

      if (filters.district !== 'all' && post.district !== filters.district) {
        return false;
      }

      if (filters.category !== 'all' && post.category !== filters.category) {
        return false;
      }

      if (query) {
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesContent = post.content.toLowerCase().includes(query);
        const matchesDistrict = post.district.toLowerCase().includes(query);
        const matchesAuthor = post.author.name.toLowerCase().includes(query);

        if (!matchesTitle && !matchesContent && !matchesDistrict && !matchesAuthor) {
          return false;
        }
      }

      // 3. Price range filter
      if (filters.priceRange && filters.priceRange !== 'all') {
        const price = post.price;
        if (filters.priceRange === 'free' && !(price === 'free' || price === 0)) {
          return false;
        }
        if (filters.priceRange === 'negotiable' && price !== 'negotiable') {
          return false;
        }
        if (typeof price === 'number') {
          if (filters.priceRange === 'under_100k' && !(price > 0 && price <= 100000)) return false;
          if (filters.priceRange === '100k_500k' && !(price > 100000 && price <= 500000)) return false;
          if (filters.priceRange === 'over_1m' && !(price >= 1000000)) return false;
        } else if (filters.priceRange !== 'free' && filters.priceRange !== 'negotiable') {
          return false;
        }
      }

      return true;
    }).map((post) => ({
      ...post,
      isMyPost: post.author.id === currentDeviceId,
    }));

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      if (filters.sortBy === 'urgent') {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === 'price_asc') {
        const getVal = (p: typeof a.price) => (p === 'free' ? 0 : typeof p === 'number' ? p : 999999999);
        return getVal(a.price) - getVal(b.price);
      }
      if (filters.sortBy === 'price_desc') {
        const getVal = (p: typeof a.price) => (p === 'free' ? 0 : typeof p === 'number' ? p : -1);
        return getVal(b.price) - getVal(a.price);
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (pagination?.pageSize) {
      const page = Math.max(1, pagination.page ?? 1);
      const pageSize = pagination.pageSize;
      const from = (page - 1) * pageSize;
      return sorted.slice(from, from + pageSize);
    }

    return sorted;
  }

  async getForumPostById(id: string): Promise<ForumPost | null> {
    const post = this.forumPosts.find((p) => p.id === id);
    if (!post) return null;
    return {
      ...post,
      isMyPost: post.author.id === getAnonymousDeviceId(),
    };
  }

  async createForumPost(
    postData: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>
  ): Promise<ForumPost> {
    const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newPost: ForumPost = {
      ...postData,
      id: `post-${Date.now()}`,
      status: postData.status || 'available',
      expiresAt: postData.expiresAt || defaultExpiry,
      likesCount: 0,
      isLiked: false,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      isMyPost: true,
    };

    this.forumPosts.unshift(newPost);
    this.saveToStorage();
    return newPost;
  }

  async deleteForumPost(postId: string): Promise<boolean> {
    const idx = this.forumPosts.findIndex((p) => p.id === postId);
    if (idx !== -1) {
      this.forumPosts.splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  async markForumPostAsSold(postId: string): Promise<boolean> {
    const post = this.forumPosts.find((p) => p.id === postId);
    if (post) {
      post.status = 'sold';
      this.saveToStorage();
      return true;
    }
    return false;
  }

  async getPostComments(postId: string): Promise<ForumComment[]> {
    return this.forumComments
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async addPostComment(
    commentData: Omit<ForumComment, 'id' | 'createdAt'>
  ): Promise<ForumComment> {
    const newComment: ForumComment = {
      ...commentData,
      id: `cmt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.forumComments.push(newComment);

    const post = this.forumPosts.find((p) => p.id === commentData.postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
    }

    this.saveToStorage();
    return newComment;
  }

  async toggleLikePost(postId: string): Promise<boolean> {
    const post = this.forumPosts.find((p) => p.id === postId);
    if (!post) return false;

    if (post.isLiked) {
      post.isLiked = false;
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.isLiked = true;
      post.likesCount += 1;
    }

    this.saveToStorage();
    return post.isLiked;
  }
}

export const mockService = new MockDataService();
