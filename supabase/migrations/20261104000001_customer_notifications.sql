-- ==============================================================================
-- PICKUP WASH - CUSTOMER NOTIFICATION SYSTEM MIGRATION
-- Migration: 20261104000001_customer_notifications.sql
-- Description: In-app customer notifications table, RLS, triggers & deduplication
-- Location: Kasur City, Pakistan
-- ==============================================================================

-- 1. NOTIFICATIONS TABLE
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

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON public.notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON public.notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_cust_unread ON public.notifications(customer_id, is_read);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3.1 Customers can ONLY read their own notifications (admins can view all)
CREATE POLICY "notifications_customer_read"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (
        customer_id = auth.uid()
        OR public.is_admin()
    );

-- 3.2 Customers can ONLY update their own notifications (specifically marking is_read)
CREATE POLICY "notifications_customer_update_read"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (customer_id = auth.uid() OR public.is_admin())
    WITH CHECK (customer_id = auth.uid() OR public.is_admin());

-- 3.3 Only admins, system triggers (SECURITY DEFINER), and service_role can insert notifications
-- This prevents customers from injecting fake system notifications
CREATE POLICY "notifications_insert_policy"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- 3.4 Customers can dismiss/delete their own notifications
CREATE POLICY "notifications_customer_delete"
    ON public.notifications FOR DELETE
    TO authenticated
    USING (customer_id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- 4. DATABASE TRIGGERS FOR AUTOMATED IN-APP NOTIFICATIONS
-- ==============================================================================

-- 4.1 Trigger function for Booking Creation
CREATE OR REPLACE FUNCTION public.fn_notify_booking_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only generate notifications if linked to an authenticated customer profile
    IF NEW.customer_id IS NOT NULL THEN
        -- Deduplication: prevent duplicate notification if one was inserted within last 30 seconds
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

-- 4.2 Trigger function for Booking Lifecycle Updates & Rescheduling/Cancellation
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
        -- A) Check Booking Status Change
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
                -- Deduplication check
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

        -- B) Check Rescheduling Update
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

-- 4.3 Trigger function for Payment Status Updates
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

