import { supabase, isSupabaseConfigured } from './supabase';
import { ProfileRecord, UpdateProfilePayload } from '@/types';

export const profileService = {
  /**
   * Fetch customer profile by user ID from public.profiles
   */
  async getProfile(userId: string): Promise<{ profile: ProfileRecord | null; error?: string }> {
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
        return { profile: null, error: error.message };
      }

      return { profile: data as ProfileRecord };
    } catch (err: any) {
      return {
        profile: null,
        error: err.message || 'An unexpected error occurred while fetching customer profile.',
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
    if (!isSupabaseConfigured()) {
      return {
        profile: null,
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      const updates: Partial<ProfileRecord> = {};

      if (payload.full_name !== undefined) updates.full_name = payload.full_name.trim();
      if (payload.phone !== undefined) updates.phone = payload.phone.trim();
      if (payload.address !== undefined) updates.address = payload.address.trim();
      if (payload.area !== undefined) updates.area = payload.area.trim();

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { profile: null, error: error.message };
      }

      return { profile: data as ProfileRecord };
    } catch (err: any) {
      return {
        profile: null,
        error: err.message || 'An error occurred while saving profile changes.',
      };
    }
  },
};

