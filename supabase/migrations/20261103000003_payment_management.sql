-- ==============================================================================
-- PICKUP WASH - PAYMENT MANAGEMENT SYSTEM MIGRATION
-- Migration: 20261103000003_payment_management.sql
-- Table public.payments, RLS Policies, Audit Synchronization & Constraints
-- ==============================================================================

-- 1. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL CHECK (
        payment_method IN ('Cash on Delivery', 'JazzCash', 'Easypaisa', 'Bank Transfer')
    ),
    payment_amount NUMERIC(10, 2) NULL, -- Nullable until actual pricing confirmed
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

-- 2. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- 3. Trigger: Automatically update updated_at timestamp
DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Trigger: Synchronize payments.payment_status back to bookings.payment_status
CREATE OR REPLACE FUNCTION public.sync_booking_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.bookings
    SET payment_status = NEW.payment_status,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.booking_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_booking_payment ON public.payments;
CREATE TRIGGER trg_sync_booking_payment
    AFTER INSERT OR UPDATE OF payment_status ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_booking_payment_status();

-- 5. Update bookings table payment_status check constraint to accept new statuses
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_status_check CHECK (
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
);

-- 6. Row Level Security (RLS) Policies on public.payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 6.1 Customers can only view their own payment records
DROP POLICY IF EXISTS "Customers can view own payments" ON public.payments;
CREATE POLICY "Customers can view own payments"
    ON public.payments FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
        OR EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = payments.booking_id AND b.customer_id = auth.uid()
        )
        OR public.is_admin()
    );

-- 6.2 Anyone can create a payment record upon booking (initial status must be Pending or Awaiting Verification)
DROP POLICY IF EXISTS "Anyone can create payment record" ON public.payments;
CREATE POLICY "Anyone can create payment record"
    ON public.payments FOR INSERT
    WITH CHECK (
        (auth.uid() IS NULL OR customer_id = auth.uid())
        AND payment_status IN ('Pending', 'Awaiting Verification', 'pending')
    );

-- 6.3 Customers can submit transaction reference (transitioning to Awaiting Verification only)
-- Customers CANNOT mark payment as Paid!
DROP POLICY IF EXISTS "Customers can submit transaction reference" ON public.payments;
CREATE POLICY "Customers can submit transaction reference"
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
        )
        OR public.is_admin()
    );

-- 6.4 Authorized administrators have full access to verify and manage payments
DROP POLICY IF EXISTS "Admins have full access to payments" ON public.payments;
CREATE POLICY "Admins have full access to payments"
    ON public.payments FOR ALL
    USING (public.is_admin());

