import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, UpdateProfilePayload } from '@/types';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const refreshUser = useCallback(async () => {
    if (isConfigured) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.warn('Failed to refresh user profile:', err);
      }
    }
  }, [isConfigured]);

  // Load session and subscribe to Supabase auth events
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (isConfigured) {
        try {
          const initialUser = await authService.getCurrentUser();
          if (isMounted) {
            setUser(initialUser);
          }
        } catch (err) {
          console.warn('Failed to load initial auth user:', err);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    // Setup live listener if Supabase is configured
    if (isConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          const profile = await authService.getCurrentUser();
          if (isMounted) {
            setUser(profile);
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isConfigured]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { user: loggedInUser, error } = await authService.signIn(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
    }
    setIsLoading(false);
    return { success: Boolean(loggedInUser), error };
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => {
    setIsLoading(true);
    const { user: newUser, error, confirmationRequired } = await authService.signUp(
      email,
      password,
      fullName,
      phone
    );
    if (newUser && !confirmationRequired) {
      setUser(newUser);
    }
    setIsLoading(false);
    return { success: Boolean(newUser), error, confirmationRequired };
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    if (!user) {
      return { success: false, error: 'User is not logged in.' };
    }

    const { profile, error } = await profileService.updateProfile(user.id, payload);
    if (error || !profile) {
      return { success: false, error: error || 'Failed to update profile.' };
    }

    // Update local user state immediately
    setUser((prev) =>
      prev
        ? {
            ...prev,
            full_name: profile.full_name,
            phone_number: profile.phone || '',
            phone: profile.phone || '',
            address: profile.address || undefined,
            area: profile.area || undefined,
            updated_at: profile.updated_at,
          }
        : null
    );

    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.signOut();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        resetPassword,
        updateProfile,
        refreshUser,
        logout,
        isAdmin: user?.role === 'admin',
        isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
