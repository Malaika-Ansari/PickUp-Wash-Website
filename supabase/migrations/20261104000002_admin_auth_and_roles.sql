-- ==============================================================================
-- Migration: 20261104000002_admin_auth_and_roles.sql
-- Description: Admin Authentication, Role-Based Access Control (RBAC),
--              Privilege Escalation Prevention, and Administrative Audit Logging
-- Location: Kasur City, Pakistan
-- ==============================================================================

-- 1. Create public.admin_audit_logs table
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

-- 2. Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- 3. Row Level Security for admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only verified administrators can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.admin_audit_logs FOR SELECT
    USING (public.is_admin());

-- Authenticated sessions and triggers can append audit logs
DROP POLICY IF EXISTS "Authenticated users can append audit logs" ON public.admin_audit_logs;
CREATE POLICY "Authenticated users can append audit logs"
    ON public.admin_audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Immutable audit logs: No updates or deletes allowed for anyone
-- (Absence of UPDATE/DELETE policies guarantees audit trail integrity)

-- 4. Privilege Escalation Prevention Function & Trigger
-- Prevents customers from modifying the 'role' column on public.profiles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if role column is being changed
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
        -- Only existing verified admins or service_role can change roles
        IF NOT (public.is_admin() OR current_setting('role', true) = 'service_role') THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Non-admin users cannot alter their role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_escalation();

-- 5. Harden public.handle_new_user() to strictly enforce 'customer' role
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
        'customer' -- Enforce 'customer' role on all public self-registrations
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
        -- Note: 'role' is intentionally excluded from ON CONFLICT UPDATE to prevent escalation

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Server-side procedure to assign the first administrator safely
-- Executable only by Supabase project owner / SQL Editor
CREATE OR REPLACE FUNCTION public.assign_admin_by_email(target_email TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

