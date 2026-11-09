-- ==============================================================================
-- PICKUP WASH - SUPABASE POSTGRESQL ARCHITECTURE & SCHEMA
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
    turnaround_time TEXT NULL,
    price_per_kg NUMERIC(10, 2) NULL,
    base_price NUMERIC(10, 2) NULL,
    special_charge NUMERIC(10, 2) NULL,
    price_unit TEXT NOT NULL DEFAULT 'per_kg',
    is_pricing_active BOOLEAN NOT NULL DEFAULT false,
    pricing_notes TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2.1 Service Pricing & Special Charges Table
CREATE TABLE IF NOT EXISTS public.service_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pricing_type TEXT NOT NULL DEFAULT 'per_kg' CHECK (
        pricing_type IN ('per_kg', 'per_item', 'special_charge', 'fixed')
    ),
    rate NUMERIC(10, 2) NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2.2 Promotions & Offers Table
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
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
    booking_status TEXT NOT NULL DEFAULT 'Request Received' CHECK (
        booking_status IN (
            'Request Received',
            'Confirmed',
            'Picked Up',
            'Washing & Ironing',
            'Ready for Delivery',
            'Delivered',
            'Cancelled',
            'Booking Request Received',
            'Booking Confirmed',
            'Clothes Picked Up'
        )
    ),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    rescheduled_date DATE,
    rescheduled_time TEXT,
    reschedule_reason TEXT,
    rescheduled_at TIMESTAMPTZ,
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

-- 2.6 Customer Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL CHECK (
        payment_method IN ('Cash on Delivery', 'JazzCash', 'Easypaisa', 'Bank Transfer')
    ),
    payment_amount NUMERIC(10, 2) NULL, -- Strictly nullable until pricing is confirmed
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (
        payment_status IN (
            'Pending',
            'Awaiting Verification',
            'Paid',
            'Failed',
            'Refunded',
            'pending',
            'paid',
            'failed',
            'refunded'
        )
    ),
    transaction_reference TEXT NULL,
    payment_notes TEXT NULL,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.7 Customer Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'system' CHECK (
        notification_type IN (
            'booking_status',
            'payment_status',
            'cancellation',
            'reschedule',
            'system'
        )
    ),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.8 Administrative Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
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

-- Customer Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON public.notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON public.notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_cust_unread ON public.notifications(customer_id, is_read);

-- Admin Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- ==============================================================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 4.1 Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

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
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4.3 Automated Booking Status History Audit Logger
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

DROP TRIGGER IF EXISTS trg_booking_status_audit ON public.bookings;
CREATE TRIGGER trg_booking_status_audit
    AFTER INSERT OR UPDATE OF booking_status ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.log_booking_status_change();

-- 4.4 Automated Notification Triggers
CREATE OR REPLACE FUNCTION public.fn_notify_booking_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.notifications
            WHERE customer_id = NEW.customer_id
              AND booking_id = NEW.id
              AND title = 'Booking Request Received'
              AND created_at > (timezone('utc'::text, now()) - INTERVAL '30 seconds')
        ) THEN
            INSERT INTO public.notifications (
                customer_id,
                booking_id,
                title,
                message,
                notification_type,
                is_read,
                created_at
            ) VALUES (
                NEW.customer_id,
                NEW.id,
                'Booking Request Received',
                'Your pickup request for ' || NEW.area || ' (Ref: ' || NEW.booking_reference || ') on ' || NEW.pickup_date || ' (' || NEW.pickup_time || ') has been received and is awaiting team confirmation.',
                'booking_status',
                false,
                timezone('utc'::text, now())
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_booking_created ON public.bookings;
CREATE TRIGGER trg_notify_booking_created
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_notify_booking_created();

CREATE OR REPLACE FUNCTION public.fn_notify_booking_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_title TEXT;
    v_msg TEXT;
    v_type TEXT := 'booking_status';
BEGIN
    IF NEW.customer_id IS NOT NULL THEN
        IF NEW.booking_status IS DISTINCT FROM OLD.booking_status THEN
            CASE NEW.booking_status
                WHEN 'Confirmed', 'Booking Confirmed' THEN
                    v_title := 'Booking Confirmed';
                    v_msg := 'Great news! Your booking ' || NEW.booking_reference || ' in ' || NEW.area || ' is confirmed. A Pickup Wash rider has been assigned for ' || NEW.pickup_date || ' (' || NEW.pickup_time || ').';
                WHEN 'Picked Up', 'Clothes Picked Up' THEN
                    v_title := 'Clothes Picked Up';
                    v_msg := 'Our rider has collected your laundry from ' || NEW.pickup_address || '. Next step: weighing and professional wash.';
                WHEN 'Washing & Ironing' THEN
                    v_title := 'Washing & Ironing Started';
                    v_msg := 'Your clothes are currently undergoing specialized washing, gentle detergent cleaning, and steam pressing.';
                WHEN 'Ready for Delivery' THEN
                    v_title := 'Ready for Delivery';
                    v_msg := 'Your garments are fresh, crisply ironed, and packaged! Our delivery rider is preparing for doorstep delivery.';
                WHEN 'Delivered' THEN
                    v_title := 'Order Delivered';
                    v_msg := 'Your laundry order (' || NEW.booking_reference || ') has been successfully delivered. Thank you for choosing Pickup Wash!';
                WHEN 'Cancelled' THEN
                    v_title := 'Booking Cancelled';
                    v_type := 'cancellation';
                    v_msg := 'Your booking request (' || NEW.booking_reference || ') has been cancelled.' || 
                             COALESCE(' Reason: ' || NEW.cancellation_reason, '');
                ELSE
                    v_title := NULL;
            END CASE;

            IF v_title IS NOT NULL THEN
                IF NOT EXISTS (
                    SELECT 1 FROM public.notifications
                    WHERE customer_id = NEW.customer_id
                      AND booking_id = NEW.id
                      AND title = v_title
                      AND created_at > (timezone('utc'::text, now()) - INTERVAL '30 seconds')
                ) THEN
                    INSERT INTO public.notifications (
                        customer_id,
                        booking_id,
                        title,
                        message,
                        notification_type,
                        is_read,
                        created_at
                    ) VALUES (
                        NEW.customer_id,
                        NEW.id,
                        v_title,
                        v_msg,
                        v_type,
                        false,
                        timezone('utc'::text, now())
                    );
                END IF;
            END IF;
        END IF;

        IF (NEW.pickup_date IS DISTINCT FROM OLD.pickup_date OR NEW.pickup_time IS DISTINCT FROM OLD.pickup_time)
           AND NEW.booking_status NOT IN ('Cancelled') THEN
            v_title := 'Pickup Slot Rescheduled';
            v_msg := 'Your pickup slot for booking ' || NEW.booking_reference || ' has been updated to ' || NEW.pickup_date || ' (' || NEW.pickup_time || ').';
            
            IF NOT EXISTS (
                SELECT 1 FROM public.notifications
                WHERE customer_id = NEW.customer_id
                  AND booking_id = NEW.id
                  AND title = v_title
                  AND created_at > (timezone('utc'::text, now()) - INTERVAL '30 seconds')
            ) THEN
                INSERT INTO public.notifications (
                    customer_id,
                    booking_id,
                    title,
                    message,
                    notification_type,
                    is_read,
                    created_at
                ) VALUES (
                    NEW.customer_id,
                    NEW.id,
                    v_title,
                    v_msg,
                    'reschedule',
                    false,
                    timezone('utc'::text, now())
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_booking_updated ON public.bookings;
CREATE TRIGGER trg_notify_booking_updated
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_notify_booking_updated();

CREATE OR REPLACE FUNCTION public.fn_notify_payment_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_title TEXT;
    v_msg TEXT;
BEGIN
    IF NEW.customer_id IS NOT NULL AND (NEW.payment_status IS DISTINCT FROM OLD.payment_status) THEN
        CASE NEW.payment_status
            WHEN 'Awaiting Verification' THEN
                v_title := 'Payment Awaiting Verification';
                v_msg := 'Your transaction reference (' || COALESCE(NEW.transaction_reference, 'Submitted') || ') for ' || NEW.payment_method || ' has been received. Our accounts team in Kasur is manually verifying it.';
            WHEN 'Paid' THEN
                v_title := 'Payment Verified & Confirmed';
                v_msg := 'Payment via ' || NEW.payment_method || 
                         CASE WHEN NEW.payment_amount IS NOT NULL THEN ' of PKR ' || NEW.payment_amount::text ELSE '' END || 
                         ' has been verified and confirmed. Thank you!';
            WHEN 'Failed' THEN
                v_title := 'Payment Verification Notice';
                v_msg := 'We could not verify your ' || NEW.payment_method || ' transfer. Please verify your transaction ID or reach out to our team at +92 300 0000000.';
            WHEN 'Refunded' THEN
                v_title := 'Payment Refunded';
                v_msg := 'Your payment via ' || NEW.payment_method || ' has been refunded by Pickup Wash accounts.';
            ELSE
                v_title := NULL;
        END CASE;

        IF v_title IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.notifications
                WHERE customer_id = NEW.customer_id
                  AND booking_id = NEW.booking_id
                  AND title = v_title
                  AND created_at > (timezone('utc'::text, now()) - INTERVAL '30 seconds')
            ) THEN
                INSERT INTO public.notifications (
                    customer_id,
                    booking_id,
                    title,
                    message,
                    notification_type,
                    is_read,
                    created_at
                ) VALUES (
                    NEW.customer_id,
                    NEW.booking_id,
                    v_title,
                    v_msg,
                    'payment_status',
                    false,
                    timezone('utc'::text, now())
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_payment_updated ON public.payments;
CREATE TRIGGER trg_notify_payment_updated
    AFTER UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_notify_payment_updated();

-- 4.6 Privilege Escalation Prevention Function & Trigger
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
        IF NOT (public.is_admin() OR current_setting('role', true) = 'service_role') THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Non-admin users cannot alter their role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_escalation();

-- 4.7 Server-Side Administrative Provisioning Function
CREATE OR REPLACE FUNCTION public.assign_admin_by_email(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    target_user RECORD;
BEGIN
    target_email := LOWER(TRIM(target_email));
    
    SELECT id, email INTO target_user
    FROM auth.users
    WHERE LOWER(email) = target_email;

    IF NOT FOUND THEN
        RETURN 'Error: User with email "' || target_email || '" does not exist in auth.users. Please create or invite the user first.';
    END IF;

    UPDATE public.profiles
    SET role = 'admin', updated_at = timezone('utc'::text, now())
    WHERE id = target_user.id;

    -- Record in audit logs
    INSERT INTO public.admin_audit_logs (
        admin_id,
        admin_email,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        target_user.id,
        target_email,
        'assign_admin_role',
        'profiles',
        target_user.id::text,
        jsonb_build_object('assigned_by', 'system_administrative_procedure', 'email', target_email)
    );

    RETURN 'Success: Administrator privileges successfully granted to ' || target_email;
END;
$$;

-- 4.8 Payment Verification Protection Trigger on payments
-- Ensures customers CANNOT set payment_status to 'Paid', modify amount, or forge verified_by
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_payment_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (NEW.payment_status IN ('Paid', 'Refunded', 'paid', 'refunded') AND (OLD.payment_status IS DISTINCT FROM NEW.payment_status))
       OR (NEW.verified_by IS NOT NULL AND OLD.verified_by IS NULL)
       OR (NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL)
       OR (NEW.payment_amount IS DISTINCT FROM OLD.payment_amount) THEN
        IF NOT (public.is_admin() OR current_setting('role', true) = 'service_role') THEN
            RAISE EXCEPTION 'Unauthorized Payment Mutation: Only verified administrators can verify payments, set amounts, or mark records as Paid.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_unauthorized_payment_verification ON public.payments;
CREATE TRIGGER trg_prevent_unauthorized_payment_verification
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_unauthorized_payment_verification();

-- 4.9 Booking Lifecycle Protection Trigger on bookings
-- Prevents customers from advancing booking status or modifying confirmed orders directly
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (OLD.booking_status IS DISTINCT FROM NEW.booking_status) THEN
        IF public.is_admin() OR current_setting('role', true) = 'service_role' THEN
            RETURN NEW;
        END IF;

        IF NEW.booking_status = 'Cancelled' THEN
            IF auth.uid() IS NOT NULL AND auth.uid() = OLD.customer_id THEN
                IF OLD.booking_status IN ('Request Received', 'Booking Request Received') THEN
                    RETURN NEW;
                ELSE
                    RAISE EXCEPTION 'Cancellation Prohibited: Orders already confirmed or picked up cannot be cancelled directly. Please contact support.';
                END IF;
            END IF;
        END IF;

        RAISE EXCEPTION 'Unauthorized Booking Status Change: Customers cannot advance or alter booking status.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_unauthorized_booking_status_change ON public.bookings;
CREATE TRIGGER trg_prevent_unauthorized_booking_status_change
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_unauthorized_booking_status_change();

-- 4.10 Notification Tampering Protection Trigger on notifications
CREATE OR REPLACE FUNCTION public.prevent_notification_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT (public.is_admin() OR current_setting('role', true) = 'service_role') THEN
        IF (OLD.title IS DISTINCT FROM NEW.title)
           OR (OLD.message IS DISTINCT FROM NEW.message)
           OR (OLD.customer_id IS DISTINCT FROM NEW.customer_id)
           OR (OLD.booking_id IS DISTINCT FROM NEW.booking_id)
           OR (OLD.notification_type IS DISTINCT FROM NEW.notification_type)
           OR (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
            RAISE EXCEPTION 'Notification Tampering Blocked: Only read status can be updated by customer.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_notification_tampering ON public.notifications;
CREATE TRIGGER trg_prevent_notification_tampering
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_notification_tampering();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

-- 5.1 Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_insert_policy"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_policy"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_delete_policy"
    ON public.profiles FOR DELETE
    USING (public.is_admin());

-- 5.2 Services Policies (Public Read Active, Admin Manage)
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "services_select_policy" ON public.services;
DROP POLICY IF EXISTS "services_admin_all" ON public.services;

CREATE POLICY "services_select_policy"
    ON public.services FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "services_admin_all"
    ON public.services FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.3 Service Pricing Policies
DROP POLICY IF EXISTS "Public can view active service pricing" ON public.service_pricing;
DROP POLICY IF EXISTS "Admins can manage service pricing" ON public.service_pricing;
DROP POLICY IF EXISTS "service_pricing_select_policy" ON public.service_pricing;
DROP POLICY IF EXISTS "service_pricing_admin_all" ON public.service_pricing;

CREATE POLICY "service_pricing_select_policy"
    ON public.service_pricing FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "service_pricing_admin_all"
    ON public.service_pricing FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.4 Promotions Policies
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
DROP POLICY IF EXISTS "promotions_select_policy" ON public.promotions;
DROP POLICY IF EXISTS "promotions_admin_all" ON public.promotions;

CREATE POLICY "promotions_select_policy"
    ON public.promotions FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "promotions_admin_all"
    ON public.promotions FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.5 Monthly Packages Policies (Public Read Active, Admin Manage)
DROP POLICY IF EXISTS "Public can view active monthly packages" ON public.monthly_packages;
DROP POLICY IF EXISTS "Admins can manage monthly packages" ON public.monthly_packages;
DROP POLICY IF EXISTS "monthly_packages_select_policy" ON public.monthly_packages;
DROP POLICY IF EXISTS "monthly_packages_admin_all" ON public.monthly_packages;

CREATE POLICY "monthly_packages_select_policy"
    ON public.monthly_packages FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "monthly_packages_admin_all"
    ON public.monthly_packages FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.6 Bookings Policies
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can cancel pending booking" ON public.bookings;
DROP POLICY IF EXISTS "Admins have full access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "bookings_select_policy" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_policy" ON public.bookings;
DROP POLICY IF EXISTS "bookings_customer_cancel" ON public.bookings;
DROP POLICY IF EXISTS "bookings_admin_all" ON public.bookings;

CREATE POLICY "bookings_select_policy"
    ON public.bookings FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
        OR public.is_admin()
    );

CREATE POLICY "bookings_insert_policy"
    ON public.bookings FOR INSERT
    WITH CHECK (
        (
            (auth.uid() IS NOT NULL AND customer_id = auth.uid())
            OR (auth.uid() IS NULL AND customer_id IS NULL)
            OR public.is_admin()
        )
        AND booking_status IN ('Request Received', 'Booking Request Received')
        AND payment_status IN ('Pending', 'pending', 'Awaiting Verification')
    );

CREATE POLICY "bookings_customer_cancel"
    ON public.bookings FOR UPDATE
    USING (
        (
            auth.uid() IS NOT NULL 
            AND auth.uid() = customer_id 
            AND booking_status IN ('Request Received', 'Booking Request Received')
        )
        OR public.is_admin()
    )
    WITH CHECK (
        (
            auth.uid() IS NOT NULL 
            AND auth.uid() = customer_id 
            AND booking_status IN ('Cancelled', 'Request Received', 'Booking Request Received')
        )
        OR public.is_admin()
    );

CREATE POLICY "bookings_admin_all"
    ON public.bookings FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.7 Booking Status History Policies
DROP POLICY IF EXISTS "Customers can view own booking history" ON public.booking_status_history;
DROP POLICY IF EXISTS "Admins have full access to status history" ON public.booking_status_history;
DROP POLICY IF EXISTS "booking_status_history_select" ON public.booking_status_history;
DROP POLICY IF EXISTS "booking_status_history_admin_all" ON public.booking_status_history;

CREATE POLICY "booking_status_history_select"
    ON public.booking_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_status_history.booking_id
            AND b.customer_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "booking_status_history_admin_all"
    ON public.booking_status_history FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.8 Customer Payments Policies
DROP POLICY IF EXISTS "Customers can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can create payment record" ON public.payments;
DROP POLICY IF EXISTS "Customers can submit transaction reference" ON public.payments;
DROP POLICY IF EXISTS "Admins have full access to payments" ON public.payments;
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_customer_tid_update" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_all" ON public.payments;

CREATE POLICY "payments_select_policy"
    ON public.payments FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
        OR EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = payments.booking_id AND b.customer_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "payments_insert_policy"
    ON public.payments FOR INSERT
    WITH CHECK (
        (
            (auth.uid() IS NOT NULL AND customer_id = auth.uid())
            OR (auth.uid() IS NULL AND customer_id IS NULL)
            OR public.is_admin()
        )
        AND payment_status IN ('Pending', 'pending', 'Awaiting Verification')
        AND verified_by IS NULL
        AND verified_at IS NULL
    );

CREATE POLICY "payments_customer_tid_update"
    ON public.payments FOR UPDATE
    USING (
        (
            auth.uid() IS NOT NULL 
            AND auth.uid() = customer_id 
            AND payment_status IN ('Pending', 'pending')
        )
        OR public.is_admin()
    )
    WITH CHECK (
        (
            auth.uid() IS NOT NULL 
            AND auth.uid() = customer_id 
            AND payment_status = 'Awaiting Verification'
            AND verified_by IS NULL
            AND verified_at IS NULL
        )
        OR public.is_admin()
    );

CREATE POLICY "payments_admin_all"
    ON public.payments FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.9 Customer Notifications Policies
DROP POLICY IF EXISTS "notifications_customer_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_customer_update_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_customer_delete" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;

CREATE POLICY "notifications_select_policy"
    ON public.notifications FOR SELECT
    USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_update_policy"
    ON public.notifications FOR UPDATE
    USING (customer_id = auth.uid() OR public.is_admin())
    WITH CHECK (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_delete_policy"
    ON public.notifications FOR DELETE
    USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_admin_all"
    ON public.notifications FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.10 Admin Audit Logs Policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Authenticated users can append audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_select" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_insert" ON public.admin_audit_logs;

CREATE POLICY "admin_audit_logs_select"
    ON public.admin_audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "admin_audit_logs_insert"
    ON public.admin_audit_logs FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND (admin_id IS NULL OR admin_id = auth.uid() OR public.is_admin())
    );

-- Immutable audit logs: Updates and deletes are prohibited for all roles

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
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
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
          (p.phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(p.phone, '[^0-9]', '', 'g'), 10) = clean_phone)
          OR
          (auth.uid() IS NOT NULL AND b.customer_id = auth.uid())
          OR
          public.is_admin()
      )
    LIMIT 1;
END;
$$;

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
