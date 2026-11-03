import { createClient } from '@supabase/supabase-js';

// Environment variables for client-side Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validates whether valid, live Supabase credentials have been configured.
 * Returns false if missing, blank, or containing default placeholder tokens.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('placeholder') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

/**
 * Centralized Supabase Client Singleton
 * Never expose service_role secret key in frontend code; only public anon key is used.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'pickupwash_auth_token',
    },
  }
);

export interface ConnectionTestResult {
  connected: boolean;
  configured: boolean;
  message: string;
  latencyMs?: number;
}

/**
 * Diagnostic utility to test actual database connectivity and schema readiness.
 * Used for live health check indicators in developer preview and error banners.
 */
export const checkDatabaseConnection = async (): Promise<ConnectionTestResult> => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      configured: false,
      message:
        'Supabase credentials are not configured. Please add your valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    };
  }

  const startTime = Date.now();
  try {
    // Ping public.services table (which has public read RLS enabled)
    const { error } = await supabase
      .from('services')
      .select('id', { head: true, count: 'exact' });

    const latencyMs = Date.now() - startTime;

    if (error) {
      // Check if schema tables are missing
      if (error.code === '42P01' || error.message?.includes('relation "public.services" does not exist')) {
        return {
          connected: false,
          configured: true,
          message:
            'Connected to Supabase project, but tables are missing. Please execute the SQL migration in supabase/schema.sql in the Supabase SQL editor.',
          latencyMs,
        };
      }

      return {
        connected: false,
        configured: true,
        message: `Database error (${error.code || 'UNKNOWN'}): ${error.message}`,
        latencyMs,
      };
    }

    return {
      connected: true,
      configured: true,
      message: 'Successfully connected to live Pickup Wash Supabase PostgreSQL database.',
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      message: `Network failure connecting to Supabase: ${err.message || 'Check your internet connection or URL.'}`,
    };
  }
};
