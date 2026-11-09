-- ==============================================================================
-- Pickup Wash - First Administrator Setup & Role Assignment
-- Location: Kasur City, Pakistan
-- ==============================================================================
-- Instructions:
-- 1. Create a user account first in the Supabase Dashboard (Authentication > Users)
--    OR register via the Pickup Wash frontend registration form.
-- 2. Open Supabase Dashboard > SQL Editor.
-- 3. Run this script, replacing 'admin@pickupwash.pk' with your authorized staff email.
-- ==============================================================================

DO $$
DECLARE
    -- REPLACE THIS WITH YOUR DESIRED ADMIN EMAIL:
    target_email TEXT := 'admin@pickupwash.pk';
    v_user_id UUID;
    v_count INT;
BEGIN
    target_email := LOWER(TRIM(target_email));

    -- Locate user in auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE LOWER(email) = target_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User "%" does not exist in auth.users. Please create or invite the user first.', target_email;
    END IF;

    -- Elevate role in public.profiles to 'admin'
    UPDATE public.profiles
    SET 
        role = 'admin',
        updated_at = timezone('utc'::text, now())
    WHERE id = v_user_id;

    -- Record in audit logs
    INSERT INTO public.admin_audit_logs (
        admin_id,
        admin_email,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        v_user_id,
        target_email,
        'assign_admin_role',
        'profiles',
        v_user_id::text,
        jsonb_build_object(
            'method', 'assign_admin_script',
            'email', target_email,
            'timestamp', timezone('utc'::text, now())
        )
    );

    RAISE NOTICE 'SUCCESS: Administrator privileges successfully granted to % (UUID: %)', target_email, v_user_id;
END $$;

-- Verify admin assignment:
SELECT id, full_name, email, role, created_at, updated_at
FROM public.profiles
WHERE role = 'admin';

