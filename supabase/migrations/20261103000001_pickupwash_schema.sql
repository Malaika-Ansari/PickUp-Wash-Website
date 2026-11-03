-- ==============================================================================
-- PICKUP WASH - SUPABASE POSTGRESQL ARCHITECTURE & MIGRATION
-- Location: Kasur City, Pakistan
-- Target: Supabase PostgreSQL (Free & Pro tiers compatible)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 Profiles Table (Linked to authenticated Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    area TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 Core Services Catalog
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 Monthly Packages Catalog
-- NOTE: Price is intentionally NULLABLE until confirmed with business in Kasur.
-- No fake or invented rates are stored.
CREATE TABLE IF NOT EXISTS public.monthly_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 Customer Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    booking_reference TEXT NOT NULL UNIQUE,
    service_type TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    area TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TEXT NOT NULL,
    special_instructions TEXT,
    payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery' CHECK (
        payment_method IN ('Cash on Delivery', 'JazzCash', 'Easypaisa', 'Bank Transfer')
    ),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid', 'refunded', 'failed')
    ),
    booking_status TEXT NOT NULL DEFAULT 'Booking Request Received' CHECK (
        booking_status IN (
            'Booking Request Received',
            'Booking Confirmed',
            'Clothes Picked Up',
            'Washing & Ironing',
            'Ready for Delivery',
            'Delivered',
            'Cancelled'
        )
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 Booking Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE & OPTIMIZATION
-- ==============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON public.bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- Booking status history indexes
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON public.booking_status_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_changed_at ON public.booking_status_history(changed_at DESC);

-- Catalog indexes
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_monthly_packages_is_active ON public.monthly_packages(is_active);

-- ==============================================================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 4.1 Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: profiles.updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: bookings.updated_at
DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 Auto-create profile record upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        phone,
        email,
        role
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'phone_number', ''),
        NEW.email,
        'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4.3 Automated Booking Status History Audit Logger
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.booking_status_history (
            booking_id,
            previous_status,
            new_status,
            changed_at,
            notes
        )
        VALUES (
            NEW.id,
            NULL,
            NEW.booking_status,
            timezone('utc'::text, now()),
            'Initial booking request submitted by customer.'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.booking_status IS DISTINCT FROM NEW.booking_status) THEN
            INSERT INTO public.booking_status_history (
                booking_id,
                previous_status,
                new_status,
                changed_at,
                notes
            )
            VALUES (
                NEW.id,
                OLD.booking_status,
                NEW.booking_status,
                timezone('utc'::text, now()),
                'Booking status updated from ' || OLD.booking_status || ' to ' || NEW.booking_status
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_booking_status_audit ON public.bookings;
CREATE TRIGGER trg_booking_status_audit
    AFTER INSERT OR UPDATE OF booking_status ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.log_booking_status_change();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all five tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.1 Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- 5.2 Services Policies (Public Read Active, Admin Manage)
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
    ON public.services FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
    ON public.services FOR ALL
    USING (public.is_admin());

-- 5.3 Monthly Packages Policies (Public Read Active, Admin Manage)
DROP POLICY IF EXISTS "Public can view active monthly packages" ON public.monthly_packages;
CREATE POLICY "Public can view active monthly packages"
    ON public.monthly_packages FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage monthly packages" ON public.monthly_packages;
CREATE POLICY "Admins can manage monthly packages"
    ON public.monthly_packages FOR ALL
    USING (public.is_admin());

-- 5.4 Bookings Policies
-- Anyone (guest or authenticated) can submit a new booking
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
CREATE POLICY "Anyone can create a booking"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

-- Authenticated customers can view only their own bookings
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
CREATE POLICY "Customers can view own bookings"
    ON public.bookings FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
        OR public.is_admin()
    );

-- Customers can cancel their own booking only if still in initial request stage
DROP POLICY IF EXISTS "Customers can cancel pending booking" ON public.bookings;
CREATE POLICY "Customers can cancel pending booking"
    ON public.bookings FOR UPDATE
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id AND booking_status = 'Booking Request Received')
        OR public.is_admin()
    )
    WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id AND booking_status = 'Cancelled')
        OR public.is_admin()
    );

-- Admins have full access to all bookings
DROP POLICY IF EXISTS "Admins have full access to bookings" ON public.bookings;
CREATE POLICY "Admins have full access to bookings"
    ON public.bookings FOR ALL
    USING (public.is_admin());

-- 5.5 Booking Status History Policies
-- Customers can view status audit trail only for bookings they own
DROP POLICY IF EXISTS "Customers can view own booking history" ON public.booking_status_history;
CREATE POLICY "Customers can view own booking history"
    ON public.booking_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_status_history.booking_id
            AND b.customer_id = auth.uid()
        )
        OR public.is_admin()
    );

-- Admins have full access to booking history
DROP POLICY IF EXISTS "Admins have full access to status history" ON public.booking_status_history;
CREATE POLICY "Admins have full access to status history"
    ON public.booking_status_history FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- 6. RPC: SECURE PUBLIC BOOKING TRACKING
-- ==============================================================================
-- Allows guests and customers to track their booking by reference code AND
-- verifying their phone number (preventing unauthorized enumeration or guessing).
CREATE OR REPLACE FUNCTION public.track_booking_secure(
    p_booking_reference TEXT,
    p_phone TEXT
)
RETURNS TABLE (
    id UUID,
    booking_reference TEXT,
    service_type TEXT,
    pickup_address TEXT,
    area TEXT,
    pickup_date DATE,
    pickup_time TEXT,
    booking_status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
DECLARE
    clean_ref TEXT := UPPER(TRIM(p_booking_reference));
    clean_phone TEXT := RIGHT(REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g'), 10);
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.booking_reference,
        b.service_type,
        b.pickup_address,
        b.area,
        b.pickup_date,
        b.pickup_time,
        b.booking_status,
        b.created_at,
        b.updated_at
    FROM public.bookings b
    LEFT JOIN public.profiles p ON b.customer_id = p.id
    WHERE UPPER(b.booking_reference) = clean_ref
      AND (
          -- If customer has linked profile, match last 10 phone digits
          (p.phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(p.phone, '[^0-9]', '', 'g'), 10) = clean_phone)
          OR
          -- If user is the authenticated owner
          (auth.uid() IS NOT NULL AND b.customer_id = auth.uid())
          OR
          -- Or if caller is admin
          public.is_admin()
      )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. INITIAL CANONICAL SEED DATA
-- ==============================================================================
-- Populates active services and monthly packages matching Pickup Wash Kasur.
-- NOTE: Price remains NULL on monthly packages until confirmed by management.
-- NO fake customer or booking records are inserted.

INSERT INTO public.services (service_name, slug, description, is_active)
VALUES
    (
        'Wash & Iron',
        'wash-and-iron',
        'Complete hygienic wash, fabric softening treatment, and crisp high-pressure steam pressing. Our most popular complete care service.',
        true
    ),
    (
        'Express Service',
        'express-service',
        'Urgent priority turnaround service for customers requiring fast wash and steam pressing within hours.',
        true
    ),
    (
        'Iron Only',
        'iron-only',
        'Wrinkle-free high-pressure steam pressing with sharp creases for everyday, formal, and traditional attire.',
        true
    ),
    (
        'Bedding & Household',
        'bedding-and-household',
        'Deep thermal sanitization and specialized washing for heavy winter comforters, blankets, bedsheets, and curtains.',
        true
    )
ON CONFLICT (service_name) DO UPDATE SET
    description = EXCLUDED.description,
    slug = EXCLUDED.slug,
    is_active = EXCLUDED.is_active;

INSERT INTO public.monthly_packages (package_name, slug, description, price, is_active)
VALUES
    (
        'Bachelor / Individual Saver',
        'bachelor-saver',
        'Designed for single professionals and students. Regular scheduled doorstep pickups throughout the month for everyday clothes.',
        NULL,
        true
    ),
    (
        'Family Essential Plan',
        'family-essential',
        'Ideal for households with routine laundry demands. Convenient twice-weekly pickups and fresh doorstep delivery.',
        NULL,
        true
    ),
    (
        'Executive Steam Press Plan',
        'executive-press',
        'Tailored for working professionals needing crisp formal shirts, shalwar kameez, and suits ready every week.',
        NULL,
        true
    )
ON CONFLICT (package_name) DO UPDATE SET
    description = EXCLUDED.description,
    slug = EXCLUDED.slug,
    is_active = EXCLUDED.is_active;
