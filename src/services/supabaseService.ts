import type {
  FilterState,
  ForumComment,
  ForumFilterState,
  ForumPost,
  GeoLocation,
  Product,
  ProductCategory,
  ProductCondition,
  ProductPrice,
  ProductStatus,
  ProductWithSeller,
  SellerProfile,
  SellerType,
  SellerWithDistance,
  User,
  PaginationParams,
} from '../types/database';
import { calculateDistanceKm } from '../utils/geo';
import { getAnonymousDeviceId } from '../utils/deviceSession';
import type { IDataService } from './db.interface';
import { mockService } from './mockService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export class SupabaseService implements IDataService {
  private get client() {
    return supabase;
  }

  // ==========================================
  // HELPER MAPPERS (Database snake_case -> TypeScript camelCase)
  // ==========================================
  private mapUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      role: row.role,
      avatar: row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: row.created_at || new Date().toISOString(),
    };
  }

  private mapSeller(row: any): SellerProfile {
    return {
      userId: row.user_id,
      shopName: row.shop_name,
      sellerType: (row.seller_type as SellerType) || 'store',
      address: row.address,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      categories: (row.categories as ProductCategory[]) || [],
      openTime: row.open_time || '08:00',
      closeTime: row.close_time || '21:00',
      isOpenNow: Boolean(row.is_open_now),
      phone: row.phone,
      zalo: row.zalo,
      rating: row.rating ? Number(row.rating) : 5.0,
      isVerified: Boolean(row.is_verified),
      description: row.description,
      isSoldOut: Boolean(row.is_sold_out),
      createdAt: row.created_at,
    };
  }

  private mapProduct(row: any): Product {
    let price: ProductPrice = 'negotiable';
    if (row.price_type === 'fixed' && row.price_amount !== null) {
      price = Number(row.price_amount);
    } else if (row.price_type === 'free') {
      price = 'free';
    }

    const currentDeviceId = getAnonymousDeviceId();
    const isMyItem = Boolean(row.is_my_item) || row.seller_id === currentDeviceId;

    return {
      id: row.id,
      sellerId: row.seller_id,
      title: row.title,
      description: row.description || '',
      category: row.category as ProductCategory,
      price,
      condition: row.condition as ProductCondition,
      images: row.images || [],
      status: row.status as ProductStatus,
      createdAt: row.created_at || new Date().toISOString(),
      isMyItem,
    };
  }

  private mapForumPost(row: any): ForumPost {
    let price: ProductPrice = 'negotiable';
    if (row.price_type === 'fixed' && row.price_amount !== null) {
      price = Number(row.price_amount);
    } else if (row.price_type === 'free') {
      price = 'free';
    }

    const authorUser = row.users || row.author;
    const currentDeviceId = getAnonymousDeviceId();
    const isMyPost = (row.author_id === currentDeviceId) || (row.author?.id === currentDeviceId);

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      content: row.content,
      category: row.category as ProductCategory,
      price,
      images: row.images || [],
      district: row.district,
      city: row.city || 'Hà Nội',
      author: {
        id: row.author_id || (authorUser?.id ?? 'author-id'),
        name: authorUser?.name || 'Người dùng Pass Đồ',
        avatar: authorUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: authorUser?.phone || '0901234567',
        zalo: authorUser?.phone || '0901234567',
        role: authorUser?.role || 'both',
      },
      isUrgent: Boolean(row.is_urgent),
      likesCount: row.likes_count || 0,
      commentsCount: row.comments_count || 0,
      createdAt: row.created_at || new Date().toISOString(),
      expiresAt: row.expires_at || undefined,
      status: (row.status as 'available' | 'sold') || 'available',
      isMyPost,
    };
  }

  // ==========================================
  // USERS & SELLERS
  // ==========================================
  async getUsers(): Promise<User[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getUsers();
    }
    const { data, error } = await this.client.from('users').select('*');
    if (error || !data) {
      return [];
    }
    return data.map((u) => this.mapUser(u));
  }

  async getUserById(id: string): Promise<User | null> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getUserById(id);
    }
    const { data, error } = await this.client.from('users').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapUser(data);
  }

  async getSellers(): Promise<SellerProfile[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getSellers();
    }
    const { data, error } = await this.client.from('seller_profiles').select('*');
    if (error || !data) {
      return [];
    }
    return data.map((s) => this.mapSeller(s));
  }

  async getSellerById(userId: string): Promise<SellerProfile | null> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getSellerById(userId);
    }
    const { data, error } = await this.client
      .from('seller_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapSeller(data);
  }

  async getNearbySellers(
    userLocation: GeoLocation,
    filters: FilterState
  ): Promise<SellerWithDistance[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getNearbySellers(userLocation, filters);
    }

    try {
      const [sellersRes, usersRes, productsRes] = await Promise.all([
        this.client.from('seller_profiles').select('*'),
        this.client.from('users').select('*'),
        this.client.from('products').select('*').eq('status', 'available'),
      ]);

      if (sellersRes.error || !sellersRes.data) {
        throw sellersRes.error;
      }

      if (sellersRes.data.length === 0) {
        return [];
      }

      const usersMap = new Map((usersRes.data || []).map((u) => [u.id, this.mapUser(u)]));
      const products = (productsRes.data || []).map((p) => this.mapProduct(p));

      const query = filters.searchQuery.trim().toLowerCase();
      const currentDeviceId = getAnonymousDeviceId();

      const sellersWithDist: SellerWithDistance[] = sellersRes.data.map((row) => {
        const seller = this.mapSeller(row);
        const distanceKm = calculateDistanceKm(userLocation, {
          latitude: seller.latitude,
          longitude: seller.longitude,
        });
        const user = usersMap.get(seller.userId);
        const availableProducts = products.filter((p) => p.sellerId === seller.userId);

        return {
          ...seller,
          distanceKm,
          user,
          productsCount: availableProducts.length,
        };
      });

      const filteredSellers = sellersWithDist.filter((seller) => {
        const isMyProfile = seller.userId === currentDeviceId;

        // Hide individual sellers if sold out (don't hide if it's user's newly registered profile)
        if (seller.sellerType === 'individual') {
          if (seller.isSoldOut) return false;
          if (!isMyProfile && (seller.productsCount ?? 0) === 0) {
            return false;
          }
        }

        // Filter by sellerType
        if (filters.sellerType && filters.sellerType !== 'all') {
          if (seller.sellerType !== filters.sellerType) return false;
        }

        // Radius filter
        if (seller.distanceKm > filters.radiusKm) return false;

        // Open now filter
        if (filters.onlyOpenNow && !seller.isOpenNow) return false;

        // Category filter
        if (filters.category !== 'all') {
          const hasCategory = seller.categories.includes(filters.category as ProductCategory);
          const hasProductWithCat = products.some(
            (p) => p.sellerId === seller.userId && p.category === filters.category
          );
          if (!hasCategory && !hasProductWithCat) return false;
        }

        // Text query filter
        if (query) {
          const matchShop = seller.shopName.toLowerCase().includes(query);
          const matchAddr = seller.address.toLowerCase().includes(query);
          const matchProd = products.some(
            (p) => p.sellerId === seller.userId && p.title.toLowerCase().includes(query)
          );
          if (!matchShop && !matchAddr && !matchProd) return false;
        }

        // Price range / Free gift filter
        if (filters.priceRange && filters.priceRange !== 'all') {
          const hasMatchingProduct = products.some((p) => {
            if (p.sellerId !== seller.userId) return false;
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

      return filteredSellers.sort((a, b) => a.distanceKm - b.distanceKm);
    } catch (err) {
      console.warn('Supabase getNearbySellers error:', err);
      return [];
    }
  }

  async registerSeller(
    sellerData: Omit<SellerProfile, 'isSoldOut'>,
    initialProduct?: Omit<Product, 'id' | 'sellerId' | 'status' | 'createdAt'>
  ): Promise<{ seller: SellerProfile; product?: Product }> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.registerSeller(sellerData, initialProduct);
    }

    try {
      // 1. Check or insert user - strictly validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      let userId = sellerData.userId;
      if (!userId || !uuidRegex.test(userId)) {
        userId = getAnonymousDeviceId();
        if (!uuidRegex.test(userId)) {
          userId = crypto.randomUUID();
        }
      }

      const { error: userErr } = await this.client.from('users').upsert({
        id: userId,
        name: sellerData.shopName,
        phone: sellerData.phone || '0901234567',
        email: `${userId}@passdo.local`,
        role: sellerData.sellerType === 'store' ? 'seller' : 'both',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      }, { onConflict: 'id' });

      if (userErr) {
        console.error('Supabase user upsert error:', userErr);
        throw userErr;
      }

      // 2. Upsert seller profile (MUST use onConflict user_id to allow updates/multiple posts)
      const { data: sellerRow, error: sellerErr } = await this.client
        .from('seller_profiles')
        .upsert({
          user_id: userId,
          shop_name: sellerData.shopName,
          seller_type: sellerData.sellerType,
          address: sellerData.address,
          latitude: sellerData.latitude,
          longitude: sellerData.longitude,
          categories: sellerData.categories,
          open_time: sellerData.openTime || '08:00',
          close_time: sellerData.closeTime || '21:00',
          is_open_now: true,
          phone: sellerData.phone,
          zalo: sellerData.zalo,
          rating: 5.0,
          is_verified: true,
          description: sellerData.description,
          is_sold_out: false,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (sellerErr || !sellerRow) {
        console.error('Supabase seller profile upsert error:', sellerErr);
        throw sellerErr;
      }

      const createdSeller = this.mapSeller(sellerRow);

      // 3. Insert initial product if provided
      let createdProduct: Product | undefined;
      if (initialProduct) {
        let priceType: 'fixed' | 'negotiable' | 'free' = 'negotiable';
        let priceAmount: number | null = null;
        if (typeof initialProduct.price === 'number') {
          priceType = 'fixed';
          priceAmount = initialProduct.price;
        } else if (initialProduct.price === 'free') {
          priceType = 'free';
        }

        const { data: prodRow, error: prodErr } = await this.client
          .from('products')
          .insert({
            seller_id: userId,
            title: initialProduct.title,
            description: initialProduct.description,
            category: initialProduct.category,
            price_type: priceType,
            price_amount: priceAmount,
            condition: initialProduct.condition,
            images: initialProduct.images,
            status: 'available',
          })
          .select()
          .single();

        if (prodErr || !prodRow) {
          console.error('Supabase product insert error:', prodErr);
          throw prodErr;
        }

        createdProduct = {
          ...this.mapProduct(prodRow),
          isMyItem: true,
        };
      }

      console.log('✅ Registered seller in Supabase successfully:', createdSeller.shopName, createdProduct?.title);
      return { seller: createdSeller, product: createdProduct };
    } catch (err) {
      console.error('Supabase registerSeller failed, falling back to mock:', err);
      return mockService.registerSeller(sellerData, initialProduct);
    }
  }

  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getProducts();
    }
    const { data, error } = await this.client.from('products').select('*');
    if (error || !data) return [];
    return data.map((p) => this.mapProduct(p));
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getProductById(id);
    }
    const { data, error } = await this.client.from('products').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapProduct(data);
  }

  async getProductsBySellerId(sellerId: string): Promise<Product[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getProductsBySellerId(sellerId);
    }
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((p) => this.mapProduct(p));
  }

  async getNearbyProducts(
    userLocation: GeoLocation,
    filters: FilterState
  ): Promise<ProductWithSeller[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getNearbyProducts(userLocation, filters);
    }

    try {
      const [prodsRes, sellersRes, usersRes] = await Promise.all([
        this.client.from('products').select('*').eq('status', 'available'),
        this.client.from('seller_profiles').select('*'),
        this.client.from('users').select('*'),
      ]);

      if (prodsRes.error || !prodsRes.data) return [];

      const sellersMap = new Map((sellersRes.data || []).map((s) => [s.user_id, this.mapSeller(s)]));
      const usersMap = new Map((usersRes.data || []).map((u) => [u.id, this.mapUser(u)]));
      const query = filters.searchQuery.trim().toLowerCase();

      const result: ProductWithSeller[] = [];

      for (const row of prodsRes.data) {
        const product = this.mapProduct(row);
        const seller = sellersMap.get(product.sellerId);
        if (!seller) continue;

        if (seller.sellerType === 'individual' && seller.isSoldOut) continue;
        if (filters.sellerType && filters.sellerType !== 'all' && seller.sellerType !== filters.sellerType) {
          continue;
        }

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
          const matchTitle = product.title.toLowerCase().includes(query);
          const matchDesc = product.description.toLowerCase().includes(query);
          const matchShop = seller.shopName.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchShop) continue;
        }

        result.push({
          ...product,
          seller,
          sellerUser: usersMap.get(seller.userId),
          distanceKm,
        });
      }

      return result.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    } catch {
      return [];
    }
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.addProduct(product);
    }

    let priceType: 'fixed' | 'negotiable' | 'free' = 'negotiable';
    let priceAmount: number | null = null;
    if (typeof product.price === 'number') {
      priceType = 'fixed';
      priceAmount = product.price;
    } else if (product.price === 'free') {
      priceType = 'free';
    }

    const { data, error } = await this.client
      .from('products')
      .insert({
        seller_id: product.sellerId,
        title: product.title,
        description: product.description,
        category: product.category,
        price_type: priceType,
        price_amount: priceAmount,
        condition: product.condition,
        images: product.images,
        status: product.status || 'available',
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('Supabase addProduct failed, falling back to mock:', error);
      return mockService.addProduct(product);
    }
    return {
      ...this.mapProduct(data),
      isMyItem: true,
    };
  }

  async markProductAsSold(productId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.markProductAsSold(productId);
    }

    try {
      const { data: prod, error } = await this.client
        .from('products')
        .update({ status: 'sold' })
        .eq('id', productId)
        .select()
        .single();

      if (error || !prod) return false;

      // Check remaining available products for this seller
      const { count } = await this.client
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', prod.seller_id)
        .eq('status', 'available');

      if (count === 0) {
        // If 0 available products left, mark seller as sold out
        await this.client
          .from('seller_profiles')
          .update({ is_sold_out: true })
          .eq('user_id', prod.seller_id)
          .eq('seller_type', 'individual');
      }

      return true;
    } catch {
      return false;
    }
  }

  async markProductAsAvailable(productId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.markProductAsAvailable(productId);
    }

    try {
      const { data: prod, error } = await this.client
        .from('products')
        .update({ status: 'available' })
        .eq('id', productId)
        .select()
        .single();

      if (error || !prod) return false;

      // Re-enable seller profile if it was marked sold out
      await this.client
        .from('seller_profiles')
        .update({ is_sold_out: false })
        .eq('user_id', prod.seller_id);

      return true;
    } catch {
      return false;
    }
  }

  async getMyProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getMyProducts();
    }
    const currentDeviceId = getAnonymousDeviceId();
    const { data } = await this.client
      .from('products')
      .select('*')
      .eq('seller_id', currentDeviceId)
      .order('created_at', { ascending: false });

    if (!data) return [];
    return data.map((p) => ({
      ...this.mapProduct(p),
      isMyItem: true,
    }));
  }

  // ==========================================
  // PHASE 2: COMMUNITY FORUM HUB
  // ==========================================
  async getForumPosts(
    filters: ForumFilterState,
    pagination?: PaginationParams
  ): Promise<ForumPost[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getForumPosts(filters, pagination);
    }

    try {
      let postsQuery = this.client
        .from('forum_posts')
        .select('*')
        .eq('type', filters.postType)
        .order('created_at', { ascending: false });

      if (filters.district && filters.district !== 'all') {
        postsQuery = postsQuery.eq('district', filters.district);
      }
      if (filters.category && filters.category !== 'all') {
        postsQuery = postsQuery.eq('category', filters.category);
      }
      if (filters.searchQuery?.trim()) {
        const q = filters.searchQuery.trim();
        postsQuery = postsQuery.or(`title.ilike.%${q}%,content.ilike.%${q}%,district.ilike.%${q}%`);
      }

      const hasCustomSortOrPrice = (filters.priceRange && filters.priceRange !== 'all') || (filters.sortBy && filters.sortBy !== 'newest');

      // Phân trang Range (Pagination) trên DB chỉ khi dùng sắp xếp mặc định và không lọc giá
      if (pagination?.pageSize && !hasCustomSortOrPrice) {
        const page = Math.max(1, pagination.page ?? 1);
        const pageSize = pagination.pageSize;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        postsQuery = postsQuery.range(from, to);
      }

      const { data: postsData, error: postsError } = await postsQuery;

      if (postsError || !postsData) {
        console.error('Supabase getForumPosts error:', postsError);
        return [];
      }

      // Tối ưu: Chỉ query user của các bài viết được tải (thay vì tải toàn bộ bảng users)
      const authorIds = Array.from(new Set(postsData.map((r: any) => r.author_id).filter(Boolean)));
      let usersMap = new Map();
      if (authorIds.length > 0) {
        const { data: usersData } = await this.client
          .from('users')
          .select('*')
          .in('id', authorIds);
        usersMap = new Map((usersData || []).map((u) => [u.id, u]));
      }

      const now = Date.now();

      const posts = postsData
        .map((row) => {
          const authorUser = usersMap.get(row.author_id);
          return this.mapForumPost({
            ...row,
            users: authorUser,
          });
        })
        .filter((p) => {
          // Auto-expire: ẩn nếu đã hết hạn và không phải bài của chính mình
          if (p.expiresAt && new Date(p.expiresAt).getTime() < now) {
            if (!p.isMyPost) return false;
          }
          // Sold out: ẩn nếu đã bán và không phải bài của chính mình
          if (p.status === 'sold' && !p.isMyPost) {
            return false;
          }

          // Price range filter
          if (filters.priceRange && filters.priceRange !== 'all') {
            const price = p.price;
            if (filters.priceRange === 'free' && !(price === 'free' || price === 0)) return false;
            if (filters.priceRange === 'negotiable' && price !== 'negotiable') return false;
            if (typeof price === 'number') {
              if (filters.priceRange === 'under_100k' && !(price > 0 && price <= 100000)) return false;
              if (filters.priceRange === '100k_500k' && !(price > 100000 && price <= 500000)) return false;
              if (filters.priceRange === 'over_1m' && !(price >= 1000000)) return false;
            } else if (filters.priceRange !== 'free' && filters.priceRange !== 'negotiable') {
              return false;
            }
          }

          return true;
        });

      // Sắp xếp
      let sortedPosts = [...posts];
      if (filters.sortBy === 'urgent') {
        sortedPosts.sort((a, b) => {
          if (a.isUrgent && !b.isUrgent) return -1;
          if (!a.isUrgent && b.isUrgent) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else if (filters.sortBy === 'price_asc') {
        sortedPosts.sort((a, b) => {
          const getVal = (pr: typeof a.price) => (pr === 'free' ? 0 : typeof pr === 'number' ? pr : 999999999);
          return getVal(a.price) - getVal(b.price);
        });
      } else if (filters.sortBy === 'price_desc') {
        sortedPosts.sort((a, b) => {
          const getVal = (pr: typeof a.price) => (pr === 'free' ? 0 : typeof pr === 'number' ? pr : -1);
          return getVal(b.price) - getVal(a.price);
        });
      }

      // Cắt trang nếu có custom filter/sort
      if (pagination?.pageSize && hasCustomSortOrPrice) {
        const page = Math.max(1, pagination.page ?? 1);
        const pageSize = pagination.pageSize;
        const from = (page - 1) * pageSize;
        return sortedPosts.slice(from, from + pageSize);
      }

      return sortedPosts;
    } catch (err) {
      console.warn('Supabase getForumPosts unexpected error:', err);
      return [];
    }
  }

  async getForumPostById(id: string): Promise<ForumPost | null> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getForumPostById(id);
    }
    const [postRes, usersRes] = await Promise.all([
      this.client.from('forum_posts').select('*').eq('id', id).maybeSingle(),
      this.client.from('users').select('*'),
    ]);
    if (postRes.error || !postRes.data) return null;
    const authorUser = (usersRes.data || []).find((u) => u.id === postRes.data.author_id);
    return this.mapForumPost({
      ...postRes.data,
      users: authorUser,
    });
  }

  async createForumPost(
    postData: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>
  ): Promise<ForumPost> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.createForumPost(postData);
    }

    try {
      // 1. Strictly validate UUID format for author_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      let authorId = postData.author?.id;
      if (!authorId || !uuidRegex.test(authorId)) {
        authorId = getAnonymousDeviceId();
        if (!uuidRegex.test(authorId)) {
          authorId = crypto.randomUUID();
        }
      }

      // 2. Upsert user in public.users to satisfy foreign key constraint
      const { error: userErr } = await this.client.from('users').upsert({
        id: authorId,
        name: postData.author?.name || 'Người dùng Pass Đồ',
        phone: postData.author?.phone || '0901234567',
        email: `${authorId}@passdo.local`,
        role: postData.author?.role || 'both',
        avatar: postData.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      }, { onConflict: 'id' });

      if (userErr) {
        console.error('Supabase author user upsert error:', userErr);
        throw userErr;
      }

      let priceType: 'fixed' | 'negotiable' | 'free' = 'negotiable';
      let priceAmount: number | null = null;
      if (typeof postData.price === 'number') {
        priceType = 'fixed';
        priceAmount = postData.price;
      } else if (postData.price === 'free') {
        priceType = 'free';
      }

      const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const corePayload: any = {
        type: postData.type,
        title: postData.title,
        content: postData.content,
        category: postData.category,
        price_type: priceType,
        price_amount: priceAmount,
        images: postData.images,
        district: postData.district,
        city: postData.city || 'Hà Nội',
        author_id: authorId,
        is_urgent: Boolean(postData.isUrgent),
        likes_count: 0,
        comments_count: 0,
      };

      // 3. First attempt: include status and expires_at
      let { data, error } = await this.client
        .from('forum_posts')
        .insert({
          ...corePayload,
          status: postData.status || 'available',
          expires_at: postData.expiresAt || defaultExpiry,
        })
        .select()
        .single();

      // If columns status or expires_at do not exist yet in DB table (error 42703), retry with core columns
      if (error && (error.code === '42703' || error.message?.includes('status') || error.message?.includes('expires_at'))) {
        console.warn('Columns status/expires_at not found in forum_posts, retrying with core columns:', error.message);
        const retryRes = await this.client
          .from('forum_posts')
          .insert(corePayload)
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error || !data) {
        console.error('Supabase createForumPost error:', error);
        throw error;
      }

      console.log('✅ Created forum post in Supabase:', data.id);
      return {
        ...this.mapForumPost({
          ...data,
          users: {
            id: authorId,
            name: postData.author?.name || 'Người dùng Pass Đồ',
            avatar: postData.author?.avatar,
            phone: postData.author?.phone,
            role: postData.author?.role,
          },
        }),
        author: postData.author,
        isMyPost: true,
      };
    } catch (err) {
      console.error('Supabase createForumPost error:', err);
      throw err;
    }
  }

  async deleteForumPost(postId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.deleteForumPost(postId);
    }
    try {
      const { error } = await this.client.from('forum_posts').delete().eq('id', postId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Supabase deleteForumPost error:', err);
      return false;
    }
  }

  async markForumPostAsSold(postId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.markForumPostAsSold(postId);
    }
    try {
      const { error } = await this.client
        .from('forum_posts')
        .update({ status: 'sold' })
        .eq('id', postId);
      if (error) {
        console.warn('Supabase markForumPostAsSold warning:', error);
      }
      return true;
    } catch {
      return true;
    }
  }

  async getPostComments(postId: string): Promise<ForumComment[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getPostComments(postId);
    }
    const { data } = await this.client
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!data) return [];
    return data.map((c) => ({
      id: c.id,
      postId: c.post_id,
      authorId: c.author_id,
      authorName: c.author_name,
      authorAvatar: c.author_avatar || '',
      content: c.content,
      offerPrice: c.offer_price ? Number(c.offer_price) : undefined,
      createdAt: c.created_at,
    }));
  }

  async addPostComment(
    commentData: Omit<ForumComment, 'id' | 'createdAt'>
  ): Promise<ForumComment> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.addPostComment(commentData);
    }
    const { data } = await this.client
      .from('forum_comments')
      .insert({
        post_id: commentData.postId,
        author_id: commentData.authorId,
        author_name: commentData.authorName,
        author_avatar: commentData.authorAvatar,
        content: commentData.content,
        offer_price: commentData.offerPrice || null,
      })
      .select()
      .single();

    if (!data) return mockService.addPostComment(commentData);
    return {
      id: data.id,
      postId: data.post_id,
      authorId: data.author_id,
      authorName: data.author_name,
      authorAvatar: data.author_avatar,
      content: data.content,
      offerPrice: data.offer_price,
      createdAt: data.created_at,
    };
  }

  async toggleLikePost(postId: string): Promise<boolean> {
    return mockService.toggleLikePost(postId);
  }
}

export const supabaseService = new SupabaseService();
