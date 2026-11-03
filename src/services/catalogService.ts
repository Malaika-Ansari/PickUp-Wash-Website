import { supabase, isSupabaseConfigured } from './supabase';
import { ServiceRecord, MonthlyPackageRecord } from '@/types';

export const catalogService = {
  /**
   * Retrieve active laundry services from public.services
   */
  async getActiveServices(): Promise<{ services: ServiceRecord[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      return {
        services: [],
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        return { services: [], error: error.message };
      }

      return { services: (data as ServiceRecord[]) || [] };
    } catch (err: any) {
      return {
        services: [],
        error: err.message || 'An error occurred while retrieving services.',
      };
    }
  },

  /**
   * Retrieve active monthly packages from public.monthly_packages
   * Prices remain nullable until officially confirmed by business management in Kasur.
   */
  async getActiveMonthlyPackages(): Promise<{ packages: MonthlyPackageRecord[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      return {
        packages: [],
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('monthly_packages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        return { packages: [], error: error.message };
      }

      return { packages: (data as MonthlyPackageRecord[]) || [] };
    } catch (err: any) {
      return {
        packages: [],
        error: err.message || 'An error occurred while retrieving monthly packages.',
      };
    }
  },
};

