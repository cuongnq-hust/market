-- ==============================================================================
-- PASS ĐỒ GẦN NHÀ - SUPABASE / POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('buyer', 'seller', 'both')),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Seller Profiles Table
CREATE TABLE IF NOT EXISTS public.seller_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    categories TEXT[] NOT NULL DEFAULT '{}',
    seller_type VARCHAR(20) NOT NULL DEFAULT 'store' CHECK (seller_type IN ('store', 'individual')),
    open_time VARCHAR(10) NOT NULL DEFAULT '08:00',
    close_time VARCHAR(10) NOT NULL DEFAULT '21:00',
    is_open_now BOOLEAN NOT NULL DEFAULT true,
    phone VARCHAR(20),
    zalo VARCHAR(50),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    is_verified BOOLEAN DEFAULT false,
    description TEXT,
    is_sold_out BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for spatial bounding box query on lat/long
CREATE INDEX IF NOT EXISTS idx_seller_profiles_lat_lon 
ON public.seller_profiles (latitude, longitude);

-- 4. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.seller_profiles(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('fixed', 'negotiable', 'free')),
    price_amount NUMERIC(15, 2), -- NULL if price_type is 'negotiable' or 'free'
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('new', 'used', 'scrap')),
    images TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- ==============================================================================
-- PHASE 2: COMMUNITY FORUM HUB (DIỄN ĐÀN CỘNG ĐỒNG 2 CHIỀU)
-- ==============================================================================

-- 5. Create Forum Posts Table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('sell', 'buy')), -- 'sell' = Cần bán gấp, 'buy' = Tìm mua / gom hàng
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('fixed', 'negotiable', 'free')),
    price_amount NUMERIC(15, 2),
    images TEXT[] NOT NULL DEFAULT '{}',
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Hà Nội',
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration nếu bảng forum_posts đã tồn tại từ trước:
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold'));
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_forum_posts_type ON public.forum_posts(type);
CREATE INDEX IF NOT EXISTS idx_forum_posts_district ON public.forum_posts(district);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON public.forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at DESC);

-- 6. Create Forum Comments & Price Offers Table
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    offer_price NUMERIC(15, 2), -- Mức giá trả / thương lượng (nếu có)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON public.forum_comments(post_id);

-- 7. Haversine Function in PostgreSQL (Calculates distance in km)
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371.0; -- Earth radius in km
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat / 2.0)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2.0)^2;
    c := 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
    RETURN ROUND((r * c)::numeric, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Helper Function: Find Sellers Within Radius
CREATE OR REPLACE FUNCTION get_nearby_sellers(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_km DOUBLE PRECISION
)
RETURNS TABLE (
    user_id UUID,
    shop_name VARCHAR,
    seller_type VARCHAR,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    categories TEXT[],
    open_time VARCHAR,
    close_time VARCHAR,
    is_open_now BOOLEAN,
    phone VARCHAR,
    zalo VARCHAR,
    rating NUMERIC,
    is_verified BOOLEAN,
    is_sold_out BOOLEAN,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.user_id,
        s.shop_name,
        s.seller_type,
        s.address,
        s.latitude,
        s.longitude,
        s.categories,
        s.open_time,
        s.close_time,
        s.is_open_now,
        s.phone,
        s.zalo,
        s.rating,
        s.is_verified,
        s.is_sold_out,
        calculate_distance_km(user_lat, user_lon, s.latitude, s.longitude) AS distance_km
    FROM public.seller_profiles s
    WHERE s.is_sold_out = false
      AND calculate_distance_km(user_lat, user_lon, s.latitude, s.longitude) <= radius_km
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==============================================================================
-- 9. PERMISSIONS / ROW LEVEL SECURITY (RLS) FOR SECURE APP ACCESS
-- ==============================================================================
-- Kích hoạt Row Level Security (RLS) trên toàn bộ các bảng nhằm ngăn chặn tấn công
-- xóa hàng loạt (bulk delete), can thiệp trái phép, hay rò rỉ dữ liệu ngoài ý muốn.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Cấp quyền tối thiểu (Least Privilege) cho anon và authenticated:
-- Tuyệt đối không GRANT DELETE tự do trên các bảng hệ thống
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.seller_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_posts TO anon, authenticated;
GRANT SELECT, INSERT ON public.forum_comments TO anon, authenticated;

-- Service role giữ toàn quyền quản trị
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- --- POLICIES CHO BẢNG USERS ---
DROP POLICY IF EXISTS "Public can view users" ON public.users;
CREATE POLICY "Public can view users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user registration and upsert" ON public.users;
CREATE POLICY "Allow user registration and upsert" ON public.users FOR INSERT WITH CHECK (id IS NOT NULL);

DROP POLICY IF EXISTS "Allow user update self" ON public.users;
CREATE POLICY "Allow user update self" ON public.users FOR UPDATE USING (id IS NOT NULL);

-- --- POLICIES CHO BẢNG SELLER_PROFILES ---
DROP POLICY IF EXISTS "Public can view seller profiles" ON public.seller_profiles;
CREATE POLICY "Public can view seller profiles" ON public.seller_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert seller profile" ON public.seller_profiles;
CREATE POLICY "Allow insert seller profile" ON public.seller_profiles FOR INSERT WITH CHECK (user_id IS NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL);

DROP POLICY IF EXISTS "Allow update seller profile" ON public.seller_profiles;
CREATE POLICY "Allow update seller profile" ON public.seller_profiles FOR UPDATE USING (user_id IS NOT NULL);

-- --- POLICIES CHO BẢNG PRODUCTS ---
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert product" ON public.products;
CREATE POLICY "Allow insert product" ON public.products FOR INSERT WITH CHECK (seller_id IS NOT NULL AND title IS NOT NULL AND length(trim(title)) > 0);

DROP POLICY IF EXISTS "Allow update product status" ON public.products;
CREATE POLICY "Allow update product status" ON public.products FOR UPDATE USING (id IS NOT NULL);

-- --- POLICIES CHO BẢNG FORUM_POSTS ---
DROP POLICY IF EXISTS "Public can view forum posts" ON public.forum_posts;
CREATE POLICY "Public can view forum posts" ON public.forum_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert forum post" ON public.forum_posts;
CREATE POLICY "Allow insert forum post" ON public.forum_posts FOR INSERT WITH CHECK (author_id IS NOT NULL AND title IS NOT NULL AND length(trim(title)) > 0);

DROP POLICY IF EXISTS "Allow update forum post status" ON public.forum_posts;
CREATE POLICY "Allow update forum post status" ON public.forum_posts FOR UPDATE USING (id IS NOT NULL);

DROP POLICY IF EXISTS "Allow delete individual forum post" ON public.forum_posts;
CREATE POLICY "Allow delete individual forum post" ON public.forum_posts FOR DELETE USING (id IS NOT NULL);

-- --- POLICIES CHO BẢNG FORUM_COMMENTS ---
DROP POLICY IF EXISTS "Public can view comments" ON public.forum_comments;
CREATE POLICY "Public can view comments" ON public.forum_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert comment" ON public.forum_comments;
CREATE POLICY "Allow insert comment" ON public.forum_comments FOR INSERT WITH CHECK (post_id IS NOT NULL AND content IS NOT NULL AND length(trim(content)) > 0);

-- ==============================================================================
-- 10. REALTIME CONFIGURATION (ĐỒNG BỘ TỨC THÌ GIỮA CÁC THIẾT BỊ KHÔNG CẦN F5)
-- ==============================================================================
-- Kích hoạt Realtime (Postgres Changes qua WebSocket) cho các bảng
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'seller_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_profiles;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'forum_posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'forum_comments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;
    END IF;
END $$;



