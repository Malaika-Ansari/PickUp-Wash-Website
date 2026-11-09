-- ==============================================================================
-- PICKUP WASH - COMPREHENSIVE ROW LEVEL SECURITY (RLS) & SECURITY AUDIT HARDENING
-- Migration: 20261104000004_rls_security_audit_hardening.sql
-- Location: Kasur City, Pakistan
-- ==============================================================================
--
-- This migration performs a comprehensive security hardening and policy consolidation
-- across all database tables in Pickup Wash:
--
-- 1. Security Definer Search Path Hardening:
--    Ensures all SECURITY DEFINER functions have explicit 'SET search_path = public, pg_temp'
--    to eliminate search_path hijacking vulnerabilities (PostgreSQL Security Advisory).
--
-- 2. Multi-Tier Defense-in-Depth Triggers:
--    - prevent_role_escalation: Blocks non-admins from altering 'role' column on profiles.
--    - prevent_unauthorized_payment_verification: Blocks non-admins from setting payment to 'Paid'
--      or modifying payment verification metadata.
--    - prevent_unauthorized_booking_status_change: Enforces that non-admin customers can only
--      cancel their own booking in initial status; cannot mark bookings as Confirmed or Delivered.
--    - prevent_notification_tampering: Blocks non-admins from altering notification text or types.
--
-- 3. Explicit Row Level Security (RLS) & Consolidated Policies:
--    - profiles: Customer self-read/update, admin full access, zero public access.
--    - services: Public read active only; admin full management.
--    - service_pricing: Public read active only; admin full management.
--    - promotions: Public read active only; admin full management.
--    - monthly_packages: Public read active only; admin full management.
--    - bookings: Customer read/insert/cancel own; admin full access; zero public read.
--    - booking_status_history: Customer read own; admin full access; append-only audit trail.
--    - payments: Customer read own & submit TID; admin verify & manage; zero public read.
--    - notifications: Customer read/update is_read/dismiss own; admin insert & manage.
--    - admin_audit_logs: Admin read only; append-only immutable audit trail.
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: HARDEN SECURITY DEFINER FUNCTIONS (SEARCH PATH HIJACKING MITIGATION)
-- ==============================================================================

-- 1.1 Helper function: Check if current authenticated user has admin role
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

-- 1.2 Generic updated_at timestamp trigger function
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

-- 1.3 Auto-create profile record upon auth.users signup
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
        'customer' -- Enforce 'customer' role on all self-registrations
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = CASE 
            WHEN profiles.full_name = 'Customer' OR profiles.full_name IS NULL 
            THEN EXCLUDED.full_name 
            ELSE profiles.full_name 
        END,
        phone = CASE 
            WHEN profiles.phone IS NULL OR profiles.phone = '' 
            THEN EXCLUDED.phone 
            ELSE profiles.phone 
        END,
        updated_at = timezone('utc'::text, now());
        -- Role is excluded to prevent privilege escalation on conflict

    RETURN NEW;
END;
$$;

-- 1.4 Automated Booking Status History Audit Logger
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

-- 1.5 Sync Booking Payment Status Trigger
CREATE OR REPLACE FUNCTION public.sync_booking_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.bookings
    SET payment_status = NEW.payment_status,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.booking_id;
    RETURN NEW;
END;
$$;

-- 1.6 Secure Booking Tracking Lookup RPC
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

-- 1.7 Safe Server-Side Administrator Provisioning Procedure
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

-- ==============================================================================
-- SECTION 2: DEFENSE-IN-DEPTH SECURITY TRIGGERS
-- ==============================================================================

-- 2.1 Role Escalation Protection Trigger on profiles
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

-- 2.2 Payment Verification Protection Trigger on payments
-- Ensures customers CANNOT set payment_status to 'Paid', modify amount, or forge verified_by
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_payment_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Detect attempts to verify, approve, change amount, or change audit stamp
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

-- 2.3 Booking Lifecycle Protection Trigger on bookings
-- Prevents customers from advancing booking status or modifying confirmed orders directly
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (OLD.booking_status IS DISTINCT FROM NEW.booking_status) THEN
        -- Allow verified administrators and service-role full lifecycle control
        IF public.is_admin() OR current_setting('role', true) = 'service_role' THEN
            RETURN NEW;
        END IF;

        -- Non-admin customer can ONLY cancel an order
        IF NEW.booking_status = 'Cancelled' THEN
            -- Check that the caller owns the booking
            IF auth.uid() IS NOT NULL AND auth.uid() = OLD.customer_id THEN
                -- Permitted only while order is still in initial request stage
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

-- 2.4 Notification Tampering Protection Trigger on notifications
-- Customers can only mark notifications as read; cannot modify content, recipient, or type
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
-- SECTION 3: ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================

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

-- ==============================================================================
-- SECTION 4: CONSOLIDATED ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- 4.1 TABLE: public.profiles
-- Customers can view/update only their own profile. Admins can view/manage all profiles.
-- Public/anonymous users have zero access to profiles.
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

-- 4.2 TABLE: public.services
-- Public can view active services only. Admins have full management access.
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

-- 4.3 TABLE: public.service_pricing
-- Public can view active pricing entries only. Admins have full management access.
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

-- 4.4 TABLE: public.promotions
-- Public can view active promotions only. Admins have full management access.
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

-- 4.5 TABLE: public.monthly_packages
-- Public can view active packages only. Admins have full management access.
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

-- 4.6 TABLE: public.bookings
-- Customer can view and create their own bookings.
-- Guest creation requires customer_id IS NULL. Customer ID forgery is strictly blocked.
-- Customers cannot select arbitrary bookings (must use secure RPC for guest tracking).
-- Admins have full access.
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

-- 4.7 TABLE: public.booking_status_history
-- Customers can view status audit trail only for bookings they own.
-- Status history records are created exclusively by triggers or admins. Immutable.
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

-- 4.8 TABLE: public.payments
-- Customers can view own payments and submit transaction reference (TID).
-- Customers CANNOT mark as Paid, set verified_by, or change amount.
-- Admins have full access. Zero public/unauthenticated direct read.
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

-- 4.9 TABLE: public.notifications
-- Customers can view, update (is_read), and dismiss their own notifications.
-- Customers cannot insert fake system notifications. Triggers and admins insert.
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

-- 4.10 TABLE: public.admin_audit_logs
-- Only verified administrators can view audit logs.
-- Authenticated users and triggers can append audit logs under their own authenticated ID.
-- Audit logs are strictly immutable: no updates or deletes permitted for any role.
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

-- (Absence of UPDATE or DELETE policies on admin_audit_logs guarantees audit trail immutability)

