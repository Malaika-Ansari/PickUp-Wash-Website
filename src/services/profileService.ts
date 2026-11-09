import { supabase, isSupabaseConfigured } from './supabase';
import { ProfileRecord, UpdateProfilePayload } from '@/types';
import { sanitizeText, sanitizePhone, sanitizeDatabaseError } from '@/utils/securityUtils';

export const profileService = {
  /**
   * Fetch customer profile by user ID from public.profiles
   */
  async getProfile(userId: string): Promise<{ profile: ProfileRecord | null; error?: string }> {
    if (!userId) return { profile: null };

    if (!isSupabaseConfigured()) {
      return {
        profile: null,
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { profile: null, error: sanitizeDatabaseError(error) };
      }

      return { profile: data as ProfileRecord };
    } catch (err: any) {
      return {
        profile: null,
        error: sanitizeDatabaseError(err),
      };
    }
  },

  /**
   * Update authenticated customer profile information in public.profiles.
   * Row Level Security ensures users can only update their own row.
   */
  async updateProfile(
    userId: string,
    payload: UpdateProfilePayload
  ): Promise<{ profile: ProfileRecord | null; error?: string }> {
    if (!userId) {
      return { profile: null, error: 'User identifier is required.' };
    }

    if (!isSupabaseConfigured()) {
      return {
        profile: null,
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      // Privilege Escalation Safeguard: Ensure role is strictly excluded from customer profile updates
      const safePayload = { ...payload };
      delete (safePayload as any).role;

      const updates: Partial<ProfileRecord> = {};

      if (safePayload.full_name !== undefined) updates.full_name = sanitizeText(safePayload.full_name, 100);
      if (safePayload.phone !== undefined) updates.phone = sanitizePhone(safePayload.phone);
      if (safePayload.address !== undefined) updates.address = sanitizeText(safePayload.address, 250);
      if (safePayload.area !== undefined) updates.area = sanitizeText(safePayload.area, 100);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { profile: null, error: sanitizeDatabaseError(error) };
      }

      return { profile: data as ProfileRecord };
    } catch (err: any) {
      return {
        profile: null,
        error: sanitizeDatabaseError(err),
      };
    }
  },

  /**
   * Admin: Fetch all registered customer profiles from public.profiles
   */
  async getAllCustomers(): Promise<{ customers: ProfileRecord[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { customers: [] };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (error) {
        return { customers: [], error: error.message };
      }

      return { customers: (data as ProfileRecord[]) || [] };
    } catch (err: any) {
      return {
        customers: [],
        error: err.message || 'Error occurred while retrieving customer records.',
      };
    }
  },
};

