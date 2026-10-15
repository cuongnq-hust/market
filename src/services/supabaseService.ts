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
} from '../types/database';
import { calculateDistanceKm } from '../utils/geo';
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
      isMyItem: Boolean(row.is_my_item),
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
      console.warn('Supabase getUsers error, falling back to mock:', error);
      return mockService.getUsers();
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
      console.warn('Supabase getSellers error, falling back to mock:', error);
      return mockService.getSellers();
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

      const usersMap = new Map((usersRes.data || []).map((u) => [u.id, this.mapUser(u)]));
      const products = (productsRes.data || []).map((p) => this.mapProduct(p));

      const query = filters.searchQuery.trim().toLowerCase();

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

      return sellersWithDist.filter((seller) => {
        // Hide individual sellers if sold out
        if (seller.sellerType === 'individual') {
          if (seller.isSoldOut || (seller.productsCount ?? 0) === 0) {
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

        return true;
      }).sort((a, b) => a.distanceKm - b.distanceKm);
    } catch (err) {
      console.warn('Supabase getNearbySellers error, falling back to mock:', err);
      return mockService.getNearbySellers(userLocation, filters);
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
      // 1. Check or insert user
      let userId = sellerData.userId;
      if (!userId || userId.startsWith('user-')) {
        userId = crypto.randomUUID();
      }

      await this.client.from('users').upsert({
        id: userId,
        name: sellerData.shopName,
        phone: sellerData.phone || '0901234567',
        email: `${userId.slice(0, 8)}@passdo.local`,
        role: sellerData.sellerType === 'store' ? 'seller' : 'both',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });

      // 2. Insert seller profile
      const { data: sellerRow, error: sellerErr } = await this.client
        .from('seller_profiles')
        .insert({
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
          is_verified: false,
          description: sellerData.description,
          is_sold_out: false,
        })
        .select()
        .single();

      if (sellerErr) throw sellerErr;
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

        if (!prodErr && prodRow) {
          createdProduct = {
            ...this.mapProduct(prodRow),
            isMyItem: true,
          };
        }
      }

      return { seller: createdSeller, product: createdProduct };
    } catch (err) {
      console.warn('Supabase registerSeller error, falling back to mock:', err);
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
    if (error || !data) return mockService.getProducts();
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
    if (error || !data) return mockService.getProductsBySellerId(sellerId);
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

      if (prodsRes.error || !prodsRes.data) return mockService.getNearbyProducts(userLocation, filters);

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
      return mockService.getNearbyProducts(userLocation, filters);
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

    if (error || !data) return mockService.addProduct(product);
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
    // Return all products created locally or with is_my_item flag
    const { data } = await this.client.from('products').select('*').order('created_at', { ascending: false });
    if (!data) return mockService.getMyProducts();
    return data.map((p) => ({
      ...this.mapProduct(p),
      isMyItem: true,
    }));
  }

  // ==========================================
  // PHASE 2: COMMUNITY FORUM HUB
  // ==========================================
  async getForumPosts(filters: ForumFilterState): Promise<ForumPost[]> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getForumPosts(filters);
    }

    try {
      let query = this.client
        .from('forum_posts')
        .select('*, users(*)')
        .eq('type', filters.postType)
        .order('created_at', { ascending: false });

      if (filters.district && filters.district !== 'all') {
        query = query.eq('district', filters.district);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      let { data, error } = await query;
      if (error) {
        console.warn('Supabase getForumPosts join warning, retrying with flat select(*):', error);
        const fallbackRes = await this.client
          .from('forum_posts')
          .select('*')
          .eq('type', filters.postType)
          .order('created_at', { ascending: false });
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (error || !data) {
        console.warn('Supabase getForumPosts error, falling back to mock:', error);
        return mockService.getForumPosts(filters);
      }

      let posts = data.map((row) => this.mapForumPost(row));

      if (filters.searchQuery?.trim()) {
        const q = filters.searchQuery.trim().toLowerCase();
        posts = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q)
        );
      }

      return posts;
    } catch (err) {
      console.warn('Supabase getForumPosts unexpected error:', err);
      return mockService.getForumPosts(filters);
    }
  }

  async getForumPostById(id: string): Promise<ForumPost | null> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.getForumPostById(id);
    }
    const { data, error } = await this.client
      .from('forum_posts')
      .select('*, users(*)')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapForumPost(data);
  }

  async createForumPost(
    postData: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>
  ): Promise<ForumPost> {
    if (!isSupabaseConfigured || !this.client) {
      return mockService.createForumPost(postData);
    }

    try {
      // Check author user
      let authorId = postData.author.id;
      if (!authorId || authorId.startsWith('user-')) {
        authorId = crypto.randomUUID();
      }

      try {
        await this.client.from('users').upsert({
          id: authorId,
          name: postData.author.name || 'Người dùng Pass Đồ',
          phone: postData.author.phone || '0901234567',
          email: `${authorId.slice(0, 8)}@passdo.local`,
          role: postData.author.role || 'both',
          avatar: postData.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        });
      } catch (uErr) {
        console.warn('Upsert user warning (ignored):', uErr);
      }

      let priceType: 'fixed' | 'negotiable' | 'free' = 'negotiable';
      let priceAmount: number | null = null;
      if (typeof postData.price === 'number') {
        priceType = 'fixed';
        priceAmount = postData.price;
      } else if (postData.price === 'free') {
        priceType = 'free';
      }

      const { data, error } = await this.client
        .from('forum_posts')
        .insert({
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
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Supabase createForumPost error:', error);
        throw error;
      }

      console.log('✅ Created forum post in Supabase:', data.id);
      return {
        ...this.mapForumPost(data),
        author: postData.author,
      };
    } catch (err) {
      console.warn('Supabase createForumPost error, falling back to mock:', err);
      return mockService.createForumPost(postData);
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
