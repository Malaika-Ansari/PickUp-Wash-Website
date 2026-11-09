-- ==============================================================================
-- PICKUP WASH - SERVICES, PRICING & PROMOTIONS MANAGEMENT MIGRATION
-- Location: Kasur City, Pakistan
-- ==============================================================================

-- 1. Extend services table with pricing & turnaround columns
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC(10, 2) NULL,
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) NULL,
ADD COLUMN IF NOT EXISTS special_charge NUMERIC(10, 2) NULL,
ADD COLUMN IF NOT EXISTS price_unit TEXT NOT NULL DEFAULT 'per_kg',
ADD COLUMN IF NOT EXISTS is_pricing_active BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS pricing_notes TEXT NULL,
ADD COLUMN IF NOT EXISTS turnaround_time TEXT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 2. Create service_pricing table for itemized and special charges
CREATE TABLE IF NOT EXISTS public.service_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pricing_type TEXT NOT NULL DEFAULT 'per_kg' CHECK (
        pricing_type IN ('per_kg', 'per_item', 'special_charge', 'fixed')
    ),
    rate NUMERIC(10, 2) NULL, -- Strictly NULL until confirmed by business management
    unit TEXT NOT NULL DEFAULT 'kg',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by service
CREATE INDEX IF NOT EXISTS idx_service_pricing_service_id ON public.service_pricing(service_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_is_active ON public.service_pricing(is_active);

-- 3. Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'free_pickup' CHECK (
        discount_type IN ('free_pickup', 'percentage', 'fixed')
    ),
    is_active BOOLEAN NOT NULL DEFAULT true,
    terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_promotions_promo_code ON public.promotions(promo_code);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON public.promotions(is_active);

-- 4. Seed Canonical 4 Core Services
INSERT INTO public.services (service_name, slug, description, turnaround_time, is_active)
VALUES
    (
        'Wash & Iron',
        'wash-and-iron',
        'Complete hygienic wash, fabric softening treatment, and crisp high-pressure steam pressing. Our most popular complete care service.',
        '24–48 Hours',
        true
    ),
    (
        'Express Service',
        'express-service',
        'Urgent priority turnaround service for customers requiring fast wash and steam pressing within hours.',
        'Urgent 12–24 Hours',
        true
    ),
    (
        'Monthly Packages',
        'monthly-packages',
        'Convenient recurring laundry packages for regular households. Weekly scheduled doorstep pickups across Kasur.',
        'Scheduled Weekly',
        true
    ),
    (
        'Pickup & Delivery',
        'pickup-and-delivery',
        'Direct doorstep laundry collection and delivery across Kasur City. Safe and sanitized laundry transit.',
        'Doorstep Collection',
        true
    )
ON CONFLICT (service_name) DO UPDATE SET
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    turnaround_time = EXCLUDED.turnaround_time,
    is_active = EXCLUDED.is_active;

-- 5. Seed First Pickup Free Promotion
INSERT INTO public.promotions (promo_code, title, description, discount_type, is_active, terms)
VALUES
    (
        'FIRST_PICKUP_FREE',
        'Your First Pickup is FREE!',
        'Complimentary doorstep collection for all first-time customers across Kasur City.',
        'free_pickup',
        true,
        'Valid on the very first booking for verified Kasur residential addresses. Payment is only collected upon delivery.'
    )
ON CONFLICT (promo_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    terms = EXCLUDED.terms;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Service Pricing
DROP POLICY IF EXISTS "Public can view active service pricing" ON public.service_pricing;
CREATE POLICY "Public can view active service pricing"
    ON public.service_pricing FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage service pricing" ON public.service_pricing;
CREATE POLICY "Admins can manage service pricing"
    ON public.service_pricing FOR ALL
    USING (public.is_admin());

-- 8. RLS Policies: Promotions
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
CREATE POLICY "Public can view active promotions"
    ON public.promotions FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
CREATE POLICY "Admins can manage promotions"
    ON public.promotions FOR ALL
    USING (public.is_admin());

