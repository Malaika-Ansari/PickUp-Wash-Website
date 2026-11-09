import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, ProfileRecord, AdminAuditLog, CreateAdminAuditLogPayload } from '@/types';
import {
  sanitizeEmail,
  sanitizeText,
  sanitizePhone,
  sanitizeDatabaseError,
  securityRateLimiter,
} from '@/utils/securityUtils';

const LOCAL_STORAGE_AUDIT_KEY = 'pickupwash_audit_logs';

const getLocalAuditLogs = (): AdminAuditLog[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAuditLogs = (list: AdminAuditLog[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_AUDIT_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.error('Error saving local audit log:', e);
  }
};

export const authService = {
  /**
   * Get the currently authenticated customer from Supabase.
   * Reads profile data from public.profiles table.
   * Returns null if unauthenticated or if Supabase is not configured.
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Read extended profile from public.profiles
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && !profileError) {
          const typedProfile = profile as ProfileRecord;
          const phoneVal = typedProfile.phone || user.user_metadata?.phone || user.user_metadata?.phone_number || '';
          return {
            id: user.id,
            email: typedProfile.email || user.email || '',
            full_name: typedProfile.full_name || user.user_metadata?.full_name || 'Customer',
            phone_number: phoneVal,
            phone: phoneVal,
            address: typedProfile.address || undefined,
            area: typedProfile.area || undefined,
            role: typedProfile.role || 'customer',
            created_at: typedProfile.created_at || user.created_at,
            updated_at: typedProfile.updated_at,
          };
        }
      } catch (err) {
        console.warn('Could not read from public.profiles, falling back to auth metadata:', err);
      }

      // Fallback to auth metadata if profiles row is pending trigger execution
      const fallbackPhone = user.user_metadata?.phone || user.user_metadata?.phone_number || '';
      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'Customer',
        phone_number: fallbackPhone,
        phone: fallbackPhone,
        role: (user.user_metadata?.role as any) || 'customer',
        created_at: user.created_at,
      };
    } catch (err) {
      console.warn('Error verifying Supabase user session:', err);
      return null;
    }
  },

  /**
   * Sign in using Supabase Authentication.
   * Authenticates against real Supabase project.
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: UserProfile | null; error?: string }> {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return { user: null, error: 'Please enter a valid email address.' };
    }

    // Rate Limiting: Prevent brute force authentication attempts
    const rateCheck = securityRateLimiter.checkLimit('login', cleanEmail);
    if (!rateCheck.allowed) {
      return {
        user: null,
        error: `Too many login attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        user: null,
        error:
          'Supabase credentials are not configured. Please add your valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        securityRateLimiter.recordAttempt('login', cleanEmail);
        return { user: null, error: sanitizeDatabaseError(error) };
      }

      if (data.user) {
        securityRateLimiter.reset('login', cleanEmail);
        const profile = await this.getCurrentUser();
        return { user: profile };
      }

      return { user: null, error: 'Unable to authenticate with provided credentials.' };
    } catch (err: any) {
      securityRateLimiter.recordAttempt('login', cleanEmail);
      return { user: null, error: sanitizeDatabaseError(err) };
    }
  },

  /**
   * Register a new customer account using Supabase Authentication.
   * Auto-triggers profile creation in public.profiles.
   */
  async signUp(
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ user: UserProfile | null; error?: string; confirmationRequired?: boolean }> {
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phone);
    const cleanName = sanitizeText(fullName, 100);

    if (!cleanEmail) {
      return { user: null, error: 'Please provide a valid email address.' };
    }
    if (!cleanName || cleanName.length < 2) {
      return { user: null, error: 'Please provide your full name (minimum 2 characters).' };
    }
    if (!password || password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters in length.' };
    }

    if (!isSupabaseConfigured()) {
      return {
        user: null,
        error:
          'Supabase credentials are not configured. Please add your valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            phone_number: cleanPhone,
          },
        },
      });

      if (error) {
        return { user: null, error: sanitizeDatabaseError(error) };
      }

      if (data.user) {
        const confirmationRequired = !data.session;

        const profile: UserProfile = {
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          phone_number: cleanPhone,
          phone: cleanPhone,
          role: 'customer',
          created_at: data.user.created_at,
        };

        return { user: profile, confirmationRequired };
      }

      return { user: null, error: 'Registration failed. Please review your details and try again.' };
    } catch (err: any) {
      return {
        user: null,
        error: sanitizeDatabaseError(err),
      };
    }
  },

  /**
   * Trigger a secure password reset email via Supabase.
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    // Rate Limiting: Prevent spamming password reset emails
    const rateCheck = securityRateLimiter.checkLimit('password_reset', cleanEmail);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Too many password reset requests. Please wait ${rateCheck.retryAfterSeconds} seconds before requesting again.`,
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error:
          'Supabase is not configured. Please add your Supabase credentials to .env to enable password resets.',
      };
    }

    try {
      securityRateLimiter.recordAttempt('password_reset', cleanEmail);
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        return { success: false, error: sanitizeDatabaseError(error) };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: sanitizeDatabaseError(err),
      };
    }
  },

  /**
   * Dedicated Admin Authentication.
   * Authenticates against Supabase, verifies public.profiles.role === 'admin'.
   * If customer or unprivileged account tries to login, automatically signs out and rejects.
   */
  async adminSignIn(
    email: string,
    password: string
  ): Promise<{ user: UserProfile | null; error?: string }> {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return { user: null, error: 'Please provide a valid administrative email address.' };
    }

    // Rate Limiting: Guard admin console from credential stuffing attacks
    const rateCheck = securityRateLimiter.checkLimit('admin_login', cleanEmail);
    if (!rateCheck.allowed) {
      return {
        user: null,
        error: `Excessive login attempts on administrator portal. Access locked for ${rateCheck.retryAfterSeconds} seconds.`,
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        user: null,
        error:
          'Supabase credentials are not configured. Please add your valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        securityRateLimiter.recordAttempt('admin_login', cleanEmail);
        return { user: null, error: sanitizeDatabaseError(error) };
      }

      if (!data.user) {
        securityRateLimiter.recordAttempt('admin_login', cleanEmail);
        return { user: null, error: 'Unable to authenticate admin credentials.' };
      }

      // Check role directly from public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userRole = (profile as ProfileRecord)?.role || data.user.user_metadata?.role || 'customer';

      if (profileError || userRole !== 'admin') {
        securityRateLimiter.recordAttempt('admin_login', cleanEmail);
        // Immediately terminate unauthorized session
        await supabase.auth.signOut();

        // Log unauthorized attempt to audit
        await this.logAdminAction({
          admin_id: data.user.id,
          admin_email: cleanEmail,
          action: 'unauthorized_admin_login_attempt',
          entity_type: 'auth',
          entity_id: data.user.id,
          details: {
            reason: 'User authenticated with customer role attempted admin login',
            attempted_email: cleanEmail,
          },
        });

        return {
          user: null,
          error:
            'Access Denied: This account does not possess administrator privileges for Pickup Wash operations.',
        };
      }

      securityRateLimiter.reset('admin_login', cleanEmail);

      const adminUser: UserProfile = {
        id: data.user.id,
        email: cleanEmail,
        full_name: (profile as ProfileRecord)?.full_name || 'Administrator',
        phone_number: (profile as ProfileRecord)?.phone || '',
        phone: (profile as ProfileRecord)?.phone || '',
        address: (profile as ProfileRecord)?.address || undefined,
        area: (profile as ProfileRecord)?.area || undefined,
        role: 'admin',
        created_at: (profile as ProfileRecord)?.created_at || data.user.created_at,
        updated_at: (profile as ProfileRecord)?.updated_at,
      };

      // Log successful admin login
      await this.logAdminAction({
        admin_id: adminUser.id,
        admin_email: adminUser.email,
        action: 'admin_login',
        entity_type: 'auth',
        entity_id: adminUser.id,
        details: { message: 'Successful administrator login to operational console' },
      });

      return { user: adminUser };
    } catch (err: any) {
      securityRateLimiter.recordAttempt('admin_login', cleanEmail);
      return {
        user: null,
        error: sanitizeDatabaseError(err),
      };
    }
  },

  /**
   * Verify if a user possesses administrative role.
   */
  async verifyAdminStatus(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !userId) return false;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) return false;
      return (data as ProfileRecord).role === 'admin';
    } catch {
      return false;
    }
  },

  /**
   * Append an audit entry to public.admin_audit_logs.
   */
  async logAdminAction(payload: CreateAdminAuditLogPayload): Promise<void> {
    const logEntry: AdminAuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      admin_id: payload.admin_id || null,
      admin_email: payload.admin_email || null,
      action: payload.action,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id || null,
      details: payload.details || null,
      ip_address: payload.ip_address || null,
      created_at: new Date().toISOString(),
    };

    // Always update local cache
    const current = getLocalAuditLogs();
    saveLocalAuditLogs([logEntry, ...current]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('admin_audit_logs').insert([
          {
            admin_id: logEntry.admin_id,
            admin_email: logEntry.admin_email,
            action: logEntry.action,
            entity_type: logEntry.entity_type,
            entity_id: logEntry.entity_id,
            details: logEntry.details,
            ip_address: logEntry.ip_address,
          },
        ]);
      } catch (err) {
        console.warn('Could not persist audit log to Supabase:', err);
      }
    }
  },

  /**
   * Retrieve recent administrative audit logs (admins only).
   */
  async getAdminAuditLogs(limit = 50): Promise<AdminAuditLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('admin_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data as AdminAuditLog[];
        }
      } catch (err) {
        console.warn('Error reading admin audit logs from Supabase:', err);
      }
    }

    return getLocalAuditLogs().slice(0, limit);
  },

  /**
   * Terminate the Supabase customer session.
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out of Supabase:', e);
      }
    }
  },
};
