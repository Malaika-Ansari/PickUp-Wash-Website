import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile } from '@/types';

export const authService = {
  /**
   * Get the currently authenticated customer from Supabase.
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

      // Read extended profile attributes if available
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        return {
          id: user.id,
          email: user.email || '',
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Customer',
          phone_number: profile?.phone_number || user.user_metadata?.phone_number || '',
          role: profile?.role || 'customer',
          created_at: user.created_at,
        };
      } catch {
        // Fallback to user metadata
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Customer',
          phone_number: user.user_metadata?.phone_number || '',
          role: 'customer',
          created_at: user.created_at,
        };
      }
    } catch (err) {
      console.warn('Error reading Supabase session:', err);
      return null;
    }
  },

  /**
   * Sign in using Supabase Authentication.
   * Real authentication only - does not create fake sessions.
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: UserProfile | null; error?: string }> {
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        error:
          'Supabase is not configured. Please add your valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the .env file to enable live authentication.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Customer',
          phone_number: data.user.user_metadata?.phone_number || '',
          role: data.user.email?.includes('admin') ? 'admin' : 'customer',
          created_at: data.user.created_at,
        };

        return { user: profile };
      }

      return { user: null, error: 'Unable to authenticate with provided credentials.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'An unexpected error occurred during login.' };
    }
  },

  /**
   * Register a new customer account using Supabase Authentication.
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
          'Supabase is not configured. Please add your valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the .env file to enable live registration.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: phone.trim(),
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName.trim(),
          phone_number: phone.trim(),
          role: 'customer',
          created_at: data.user.created_at,
        };

        // If email confirmation is enabled on Supabase, session might be null initially
        const confirmationRequired = !data.session;

        return { user: profile, confirmationRequired };
      }

      return { user: null, error: 'Registration failed. Please check your details.' };
    } catch (err: any) {
      return {
        user: null,
        error: err.message || 'An unexpected error occurred during registration.',
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
          'Supabase is not configured. Please configure your Supabase credentials in the .env file to enable password resets.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
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
   * Sign out and terminate the Supabase session.
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out from Supabase:', e);
      }
    }
  },
};
