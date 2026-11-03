-- ==============================================================================
-- PICKUP WASH - BOOKING MANAGEMENT SYSTEM MIGRATION
-- Migration: 20261103000002_booking_management.sql
-- Consistent Statuses, 3-Hour Cancellation/Rescheduling Support & Strict RLS
-- ==============================================================================

-- 1. Add Rescheduling and Cancellation Columns to public.bookings
ALTER TABLE public.bookings 
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rescheduled_date DATE,
    ADD COLUMN IF NOT EXISTS rescheduled_time TEXT,
    ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
    ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMPTZ;

-- 2. Update Booking Status Check Constraint to include the 7 Canonical Statuses
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;

ALTER TABLE public.bookings ADD CONSTRAINT bookings_booking_status_check CHECK (
    booking_status IN (
        'Request Received',
        'Confirmed',
        'Picked Up',
        'Washing & Ironing',
        'Ready for Delivery',
        'Delivered',
        'Cancelled',
        -- Backward compatibility aliases
        'Booking Request Received',
        'Booking Confirmed',
        'Clothes Picked Up'
    )
);

-- Update default value for booking_status
ALTER TABLE public.bookings ALTER COLUMN booking_status SET DEFAULT 'Request Received';

-- 3. Enhance Booking Status History Trigger to record cancellation & rescheduling notes
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
            'Booking request initially submitted by customer.'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- If status changed
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
                CASE 
                    WHEN NEW.booking_status = 'Cancelled' AND NEW.cancellation_reason IS NOT NULL 
                        THEN 'Cancellation: ' || NEW.cancellation_reason
                    ELSE 'Status updated from ' || OLD.booking_status || ' to ' || NEW.booking_status
                END
            );
        -- If rescheduled without status change
        ELSIF (OLD.pickup_date IS DISTINCT FROM NEW.pickup_date OR OLD.pickup_time IS DISTINCT FROM NEW.pickup_time) THEN
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
                'Pickup rescheduled from ' || OLD.pickup_date || ' (' || OLD.pickup_time || ') to ' || 
                NEW.pickup_date || ' (' || NEW.pickup_time || ')' ||
                CASE WHEN NEW.reschedule_reason IS NOT NULL THEN '. Reason: ' || NEW.reschedule_reason ELSE '' END
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS Insert Policy: Prevent customers from booking for other customers
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
CREATE POLICY "Anyone can create a booking"
    ON public.bookings FOR INSERT
    WITH CHECK (
        -- If authenticated, customer_id must equal caller's auth.uid()
        auth.uid() IS NULL OR customer_id = auth.uid()
    );

-- 5. Update RLS Update Policy: Customer can only modify within eligible statuses (not after pickup)
DROP POLICY IF EXISTS "Customers can cancel pending booking" ON public.bookings;
DROP POLICY IF EXISTS "Customers can modify own eligible bookings" ON public.bookings;
CREATE POLICY "Customers can modify own eligible bookings"
    ON public.bookings FOR UPDATE
    USING (
        (
            auth.uid() IS NOT NULL 
            AND auth.uid() = customer_id 
            AND booking_status IN ('Request Received', 'Confirmed', 'Booking Request Received', 'Booking Confirmed')
        )
        OR public.is_admin()
    )
    WITH CHECK (
        (
            auth.uid() IS NOT NULL 
            AND auth.uid() = customer_id 
            AND (
                -- Customer can cancel
                booking_status = 'Cancelled' 
                -- Or customer can reschedule date/time while remaining in Request Received/Confirmed
                OR booking_status IN ('Request Received', 'Confirmed', 'Booking Request Received', 'Booking Confirmed')
            )
        )
        OR public.is_admin()
    );
