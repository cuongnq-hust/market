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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_type ON public.forum_posts(type);
CREATE INDEX IF NOT EXISTS idx_forum_posts_district ON public.forum_posts(district);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category);
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
-- 9. PERMISSIONS / ROW LEVEL SECURITY (RLS) FOR PUBLIC APP ACCESS
-- ==============================================================================
-- Cho phép đọc/ghi công khai cho ứng dụng chợ đồ cũ (không yêu cầu đăng nhập phức tạp)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.users TO anon, authenticated, service_role;
GRANT ALL ON public.seller_profiles TO anon, authenticated, service_role;
GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON public.forum_posts TO anon, authenticated, service_role;
GRANT ALL ON public.forum_comments TO anon, authenticated, service_role;

-- ==============================================================================
-- 10. SAMPLE SEED DATA (DỮ LIỆU MẪU BAN ĐẦU TẠI HÀ NỘI)
-- ==============================================================================
-- Chạy phần này trong SQL Editor của Supabase nếu muốn có sẵn các điểm bán mẫu trên bản đồ:

INSERT INTO public.users (id, name, phone, email, role, avatar)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Vựa Phế Liệu & Ve Chai Chú Ba', '0903123456', 'chuba@passdo.local', 'seller', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'),
    ('a0000000-0000-0000-0000-000000000002', 'Cửa Hàng Điện Tử Cũ Hoàng Phát', '0912987654', 'hoangphat@passdo.local', 'seller', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    ('a0000000-0000-0000-0000-000000000003', 'Kho Thanh Lý Đồ Gỗ Cũ Cầu Giấy', '0988776655', 'dogo@passdo.local', 'seller', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.seller_profiles (user_id, shop_name, seller_type, address, latitude, longitude, categories, open_time, close_time, is_open_now, phone, zalo, rating, is_verified, is_sold_out, description)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Vựa Phế Liệu & Ve Chai Chú Ba', 'store', 'Số 15 ngõ 84 Ngọc Khánh, Ba Đình, Hà Nội', 21.031500, 105.819000, ARRAY['scrap', 'appliances'], '07:30', '18:30', true, '0903123456', '0903123456', 4.9, true, false, 'Chuyên thu gom ve chai, máy móc hỏng, tủ lạnh cũ, bình ắc quy.'),
    ('a0000000-0000-0000-0000-000000000002', 'Cửa Hàng Điện Tử Cũ Hoàng Phát', 'store', 'Số 112 Tây Sơn, Đống Đa, Hà Nội', 21.011800, 105.824500, ARRAY['electronics'], '08:30', '21:00', true, '0912987654', '0912987654', 4.8, true, false, 'Mua bán màn hình máy tính cũ, case văn phòng, laptop cũ giá sinh viên.'),
    ('a0000000-0000-0000-0000-000000000003', 'Kho Thanh Lý Đồ Gỗ Cũ Cầu Giấy', 'store', 'Số 68 Xuân Thủy, Cầu Giấy, Hà Nội', 21.036800, 105.789200, ARRAY['furniture', 'appliances'], '08:00', '20:00', true, '0988776655', '0988776655', 4.7, true, false, 'Thanh lý bàn ghế văn phòng, tủ quần áo, giá sách chuyển trọ.')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.products (seller_id, title, description, category, price_type, price_amount, condition, images, status)
VALUES
    ('a0000000-0000-0000-0000-000000000002', 'Màn hình Dell 24 inch Ultrasharp cũ', 'Màn hình hiển thị đẹp, không điểm chết, chân đế nâng hạ tốt.', 'electronics', 'fixed', 1450000, 'used', ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'], 'available'),
    ('a0000000-0000-0000-0000-000000000003', 'Bàn làm việc gỗ thông 1m2 x 60cm', 'Bàn còn rất mới 95%, phù hợp sinh viên làm việc tại nhà.', 'furniture', 'fixed', 350000, 'used', ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80'], 'available')
ON CONFLICT (id) DO NOTHING;

