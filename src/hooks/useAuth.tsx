import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { authService } from '@/services/authService';
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
  logout: () => Promise<void>;
  isAdmin: boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

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
      } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  const register = async (email: string, password: string, fullName: string, phone: string) => {
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
