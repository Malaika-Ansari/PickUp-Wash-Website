-- ==============================================================================
-- PICKUP WASH - SUPABASE POSTGRESQL ARCHITECTURE & SCHEMA
-- Location: Kasur City, Pakistan
-- Compatible with Supabase Free-Tier
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    address TEXT,
    area TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Core Laundry Services Catalog
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_per_unit NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    turnaround_time TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed Initial Services
INSERT INTO public.services (id, title, slug, description, price_per_unit, unit, turnaround_time, is_active)
VALUES
    ('wash-and-iron', 'Wash & Steam Iron', 'wash-and-iron', 'Complete hygienic wash, fabric softening, and high-pressure steam pressing.', 180.00, 'suit', '24–48 Hours', true),
    ('steam-iron-only', 'Steam Ironing Only', 'steam-iron-only', 'Crisp, wrinkle-free pressing with sharp creases for formal and traditional wear.', 60.00, 'suit', 'Same Day / 24 Hours', true),
    ('wash-and-fold', 'Wash & Fold (Bulk Laundry)', 'wash-and-fold', 'Casual clothes, t-shirts, towels, bedsheets washed and neatly folded.', 160.00, 'kg', '24 Hours', true),
    ('bedding-heavy', 'Bedding, Blankets & Curtains', 'bedding-heavy', 'Deep sanitization and cleaning for heavy winter comforters, quilts, and blankets.', 650.00, 'piece', '48–72 Hours', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Customer Bookings & Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    area TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_pickup' CHECK (
        status IN (
            'pending_pickup',
            'picked_up',
            'processing',
            'ironing',
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'cancelled'
        )
    ),
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    special_instructions TEXT,
    payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery' CHECK (
        payment_method IN ('cash_on_delivery', 'easypaisa_jazzcash', 'bank_transfer')
    ),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid')
    ),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Order Line Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    service_id TEXT REFERENCES public.services(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) DEFAULT 1.00,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- 6. Indices for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Services are publicly readable
CREATE POLICY "Public services are viewable by everyone" 
    ON public.services FOR SELECT 
    USING (is_active = true);

-- Profiles: Users can view & update their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Orders: Anyone can create a booking
CREATE POLICY "Anyone can create an order" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

-- Orders: Anyone can look up an order by its unique tracking number
CREATE POLICY "Anyone can track an order by tracking code" 
    ON public.orders FOR SELECT 
    USING (true);

-- Orders: Authenticated users can view their own orders
CREATE POLICY "Users can view their own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = user_id);

-- Admins: Full access (based on profile role)
CREATE POLICY "Admins have full access to orders" 
    ON public.orders FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

