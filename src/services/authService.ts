import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile } from '@/types';

const LOCAL_USER_KEY = 'pickupwash_auth_user';

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          return {
            id: user.id,
            email: user.email || '',
            full_name: profile?.full_name || user.user_metadata?.full_name || 'Customer',
            phone_number: profile?.phone_number || '',
            role: profile?.role || 'customer',
            created_at: user.created_at,
          };
        }
      } catch (err) {
        console.warn('Error reading Supabase user session:', err);
      }
    }

    // Local fallback check
    const cached = localStorage.getItem(LOCAL_USER_KEY);
    return cached ? JSON.parse(cached) : null;
  },

  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'Customer',
            phone_number: data.user.user_metadata?.phone_number || '',
            role: data.user.email?.includes('admin') ? 'admin' : 'customer',
            created_at: data.user.created_at,
          };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
          return { user: profile };
        }
      } catch (err: any) {
        return { user: null, error: err.message || 'Login failed' };
      }
    }

    // Dev/Offline mock login helper
    const mockUser: UserProfile = {
      id: 'usr-dev-01',
      email,
      full_name: email.split('@')[0],
      phone_number: '+92 300 1234567',
      role: email.includes('admin') ? 'admin' : 'customer',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    return { user: mockUser };
  },

  async signUp(email: string, password: string, fullName: string, phone: string): Promise<{ user: UserProfile | null; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone_number: phone },
          },
        });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email,
            full_name: fullName,
            phone_number: phone,
            role: 'customer',
            created_at: data.user.created_at,
          };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
          return { user: profile };
        }
      } catch (err: any) {
        return { user: null, error: err.message || 'Registration failed' };
      }
    }

    // Dev/Offline mock register
    const mockUser: UserProfile = {
      id: 'usr-dev-' + Date.now(),
      email,
      full_name: fullName,
      phone_number: phone,
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    return { user: mockUser };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out from Supabase:', e);
      }
    }
    localStorage.removeItem(LOCAL_USER_KEY);
  },
};

