import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, ProfileRecord } from '@/types';

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
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        error:
          'Supabase credentials are not configured. Please add your valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile = await this.getCurrentUser();
        return { user: profile };
      }

      return { user: null, error: 'Unable to authenticate with provided credentials.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'An unexpected network error occurred during login.' };
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
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        error:
          'Supabase credentials are not configured. Please add your valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPhone = phone.trim();
      const trimmedName = fullName.trim();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            phone: trimmedPhone,
            phone_number: trimmedPhone,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Confirmation is required if session is null initially (Supabase email confirmation setting)
        const confirmationRequired = !data.session;

        const profile: UserProfile = {
          id: data.user.id,
          email: trimmedEmail,
          full_name: trimmedName,
          phone_number: trimmedPhone,
          phone: trimmedPhone,
          role: 'customer',
          created_at: data.user.created_at,
        };

        return { user: profile, confirmationRequired };
      }

      return { user: null, error: 'Registration failed. Please review your details and try again.' };
    } catch (err: any) {
      return {
        user: null,
        error: err.message || 'An unexpected error occurred during customer registration.',
      };
    }
  },

  /**
   * Trigger a secure password reset email via Supabase.
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error:
          'Supabase is not configured. Please add your Supabase credentials to .env to enable password resets.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to send password reset email. Please try again.',
      };
    }
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
