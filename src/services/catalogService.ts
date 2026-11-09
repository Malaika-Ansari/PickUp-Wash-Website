import { supabase, isSupabaseConfigured } from './supabase';
import { 
  ServiceRecord, 
  MonthlyPackageRecord, 
  ServicePricingRecord, 
  PromotionRecord 
} from '@/types';
import { authService } from './authService';

// =============================================================================
// Canonical Fallback Fixtures (Offline & Sandbox Environments)
// Location: Kasur City, Pakistan
// IMPORTANT: Prices are strictly null until officially set by business management.
// =============================================================================
const DEFAULT_SERVICES: ServiceRecord[] = [
  {
    id: 'srv-1',
    service_name: 'Wash & Iron',
    slug: 'wash-and-iron',
    description: 'Complete hygienic wash, fabric softening treatment, and crisp high-pressure steam pressing. Our most popular complete care service.',
    turnaround_time: '24–48 Hours',
    price_per_kg: null, // Not Set until officially decided
    base_price: null,
    special_charge: null,
    price_unit: 'per_kg',
    is_pricing_active: false,
    pricing_notes: 'Pricing to be confirmed with Kasur shop owner',
    is_active: true,
    created_at: new Date('2026-11-01T08:00:00Z').toISOString(),
  },
  {
    id: 'srv-2',
    service_name: 'Express Service',
    slug: 'express-service',
    description: 'Urgent priority turnaround service for customers requiring fast wash and steam pressing within hours.',
    turnaround_time: 'Urgent 12–24 Hours',
    price_per_kg: null,
    base_price: null,
    special_charge: null,
    price_unit: 'per_kg',
    is_pricing_active: false,
    pricing_notes: 'Urgent rush fee applies upon confirmation',
    is_active: true,
    created_at: new Date('2026-11-01T08:05:00Z').toISOString(),
  },
  {
    id: 'srv-3',
    service_name: 'Monthly Packages',
    slug: 'monthly-packages',
    description: 'Convenient recurring laundry packages for regular households. Weekly scheduled doorstep pickups across Kasur.',
    turnaround_time: 'Scheduled Weekly',
    price_per_kg: null,
    base_price: null,
    special_charge: null,
    price_unit: 'fixed',
    is_pricing_active: false,
    pricing_notes: 'Tailored for small, medium, and large families',
    is_active: true,
    created_at: new Date('2026-11-01T08:10:00Z').toISOString(),
  },
  {
    id: 'srv-4',
    service_name: 'Pickup & Delivery',
    slug: 'pickup-and-delivery',
    description: 'Direct doorstep laundry collection and delivery across Kasur City. Safe and sanitized laundry transit.',
    turnaround_time: 'Doorstep Collection',
    price_per_kg: null,
    base_price: null,
    special_charge: null,
    price_unit: 'order',
    is_pricing_active: false,
    pricing_notes: 'Complimentary on qualifying volumes',
    is_active: true,
    created_at: new Date('2026-11-01T08:15:00Z').toISOString(),
  },
];

const DEFAULT_PACKAGES: MonthlyPackageRecord[] = [
  {
    id: 'pkg-1',
    package_name: 'Bachelor / Individual Saver',
    slug: 'bachelor-saver',
    description: 'Regular doorstep pickups throughout the month for everyday wear. Ideal for single professionals and students in Kasur.',
    price: null, // Stored as NULL until confirmed
    is_active: true,
    created_at: new Date('2026-11-01T08:30:00Z').toISOString(),
  },
  {
    id: 'pkg-2',
    package_name: 'Family Essential Plan',
    slug: 'family-essential',
    description: 'Ideal for households with routine laundry demands. Convenient twice-weekly pickups and fresh doorstep delivery.',
    price: null, // Stored as NULL until confirmed
    is_active: true,
    created_at: new Date('2026-11-01T08:35:00Z').toISOString(),
  },
  {
    id: 'pkg-3',
    package_name: 'Executive Steam Press Plan',
    slug: 'executive-press',
    description: 'Tailored for working professionals needing crisp formal shirts, shalwar kameez, and suits ready every week.',
    price: null, // Stored as NULL until confirmed
    is_active: true,
    created_at: new Date('2026-11-01T08:40:00Z').toISOString(),
  },
];

const DEFAULT_PROMOTIONS: PromotionRecord[] = [
  {
    id: 'promo-1',
    promo_code: 'FIRST_PICKUP_FREE',
    title: 'Your First Pickup is FREE!',
    description: 'Complimentary doorstep collection for all first-time customers across Kasur City.',
    discount_type: 'free_pickup',
    is_active: true,
    terms: 'Valid on the very first booking for verified Kasur residential addresses. Payment is only collected upon safe delivery.',
    created_at: new Date('2026-11-01T09:00:00Z').toISOString(),
  },
];

const DEFAULT_SERVICE_PRICING: ServicePricingRecord[] = [
  {
    id: 'prc-1',
    service_id: 'srv-1',
    title: 'Wash & Steam Press Per Kilogram',
    pricing_type: 'per_kg',
    rate: null, // Empty until decided
    unit: 'kg',
    description: 'Standard per-kg charge for washed, sanitized, and steam pressed casual garments.',
    is_active: true,
    created_at: new Date('2026-11-01T09:10:00Z').toISOString(),
  },
  {
    id: 'prc-2',
    service_id: 'srv-2',
    title: 'Express Rush Turnaround Charge',
    pricing_type: 'special_charge',
    rate: null, // Empty until decided
    unit: 'order',
    description: 'Special expedite surcharge for urgent same-day processing in Kasur.',
    is_active: true,
    created_at: new Date('2026-11-01T09:15:00Z').toISOString(),
  },
];

// Helper to access and initialize localStorage cache
function getCache<T>(key: string, defaultVal: T[]): T[] {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setCache<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to write cache for ${key}:`, err);
  }
}

export const catalogService = {
  // ===========================================================================
  // 1. LAUNDRY SERVICES MANAGEMENT
  // ===========================================================================

  /**
   * Public & Customer: Retrieve active laundry services from public.services
   */
  async getActiveServices(): Promise<{ services: ServiceRecord[]; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return { services: data as ServiceRecord[] };
        }
      } catch (err: any) {
        console.warn('Supabase getActiveServices notice:', err);
      }
    }

    const all = getCache<ServiceRecord>('pickupwash_services_cache', DEFAULT_SERVICES);
    return { services: all.filter((s) => s.is_active) };
  },

  /**
   * Admin: Retrieve all services (active and inactive)
   */
  async getAllServices(): Promise<{ services: ServiceRecord[]; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return { services: data as ServiceRecord[] };
        }
      } catch (err: any) {
        console.warn('Supabase getAllServices notice:', err);
      }
    }

    return { services: getCache<ServiceRecord>('pickupwash_services_cache', DEFAULT_SERVICES) };
  },

  /**
   * Admin: Add a new laundry service
   */
  async createService(
    serviceData: Omit<ServiceRecord, 'id' | 'created_at'>
  ): Promise<{ service: ServiceRecord | null; error?: string }> {
    const slug = serviceData.slug || serviceData.service_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newService: ServiceRecord = {
      ...serviceData,
      id: crypto.randomUUID ? crypto.randomUUID() : `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('services')
          .insert([newService])
          .select()
          .single();

        if (error) {
          return { service: null, error: error.message };
        }
        if (data) {
          authService.logAdminAction({
            action: 'create_service',
            entity_type: 'service',
            entity_id: data.id,
            details: { service_name: data.service_name, slug: data.slug },
          }).catch(console.warn);

          return { service: data as ServiceRecord };
        }
      } catch (err: any) {
        console.warn('Supabase createService notice:', err);
      }
    }

    // Local cache fallback
    const list = getCache<ServiceRecord>('pickupwash_services_cache', DEFAULT_SERVICES);
    list.push(newService);
    setCache('pickupwash_services_cache', list);

    authService.logAdminAction({
      action: 'create_service',
      entity_type: 'service',
      entity_id: newService.id,
      details: { service_name: newService.service_name, slug: newService.slug },
    }).catch(console.warn);

    return { service: newService };
  },

  /**
   * Admin: Update an existing laundry service
   */
  async updateService(
    id: string,
    updates: Partial<ServiceRecord>
  ): Promise<{ success: boolean; service?: ServiceRecord; error?: string }> {
    const cleanUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('services')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        authService.logAdminAction({
          action: 'update_service',
          entity_type: 'service',
          entity_id: id,
          details: cleanUpdates,
        }).catch(console.warn);

        return { success: true, service: data as ServiceRecord };
      } catch (err: any) {
        console.warn('Supabase updateService notice:', err);
      }
    }

    // Local cache fallback
    const list = getCache<ServiceRecord>('pickupwash_services_cache', DEFAULT_SERVICES);
    let updatedObj: ServiceRecord | undefined;
    const updated = list.map((s) => {
      if (s.id === id) {
        updatedObj = { ...s, ...cleanUpdates };
        return updatedObj;
      }
      return s;
    });

    setCache('pickupwash_services_cache', updated);

    authService.logAdminAction({
      action: 'update_service',
      entity_type: 'service',
      entity_id: id,
      details: cleanUpdates,
    }).catch(console.warn);

    return { success: true, service: updatedObj };
  },

  /**
   * Admin: Toggle service active/inactive status
   */
  async toggleServiceStatus(id: string, is_active: boolean): Promise<boolean> {
    const res = await this.updateService(id, { is_active });
    return res.success;
  },

  // ===========================================================================
  // 2. PRICING & SPECIAL CHARGES MANAGEMENT
  // ===========================================================================

  /**
   * Admin: Update direct pricing on a service
   * IMPORTANT: rate values can be null (Not Set)
   */
  async updateServiceDirectPricing(
    id: string,
    pricingData: {
      price_per_kg?: number | null;
      base_price?: number | null;
      special_charge?: number | null;
      price_unit?: string;
      is_pricing_active?: boolean;
      pricing_notes?: string;
    }
  ): Promise<boolean> {
    const res = await this.updateService(id, pricingData);
    return res.success;
  },

  /**
   * Retrieve all pricing entries (optionally filtered by service)
   */
  async getAllServicePricing(serviceId?: string): Promise<{ pricing: ServicePricingRecord[]; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('service_pricing').select('*').order('created_at', { ascending: true });
        if (serviceId) {
          query = query.eq('service_id', serviceId);
        }
        const { data, error } = await query;
        if (!error && data) {
          return { pricing: data as ServicePricingRecord[] };
        }
      } catch (err: any) {
        console.warn('Supabase getAllServicePricing notice:', err);
      }
    }

    const all = getCache<ServicePricingRecord>('pickupwash_pricing_cache', DEFAULT_SERVICE_PRICING);
    return { pricing: serviceId ? all.filter((p) => p.service_id === serviceId) : all };
  },

  /**
   * Admin: Create a new pricing item (per-kg or special charge)
   */
  async createPricingItem(
    itemData: Omit<ServicePricingRecord, 'id' | 'created_at'>
  ): Promise<{ pricingItem: ServicePricingRecord | null; error?: string }> {
    const newItem: ServicePricingRecord = {
      ...itemData,
      id: crypto.randomUUID ? crypto.randomUUID() : `prc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('service_pricing')
          .insert([newItem])
          .select()
          .single();

        if (error) return { pricingItem: null, error: error.message };
        if (data) {
          authService.logAdminAction({
            action: 'create_service_pricing',
            entity_type: 'service_pricing',
            entity_id: data.id,
            details: { title: data.title, rate: data.rate },
          }).catch(console.warn);

          return { pricingItem: data as ServicePricingRecord };
        }
      } catch (err: any) {
        console.warn('Supabase createPricingItem notice:', err);
      }
    }

    const list = getCache<ServicePricingRecord>('pickupwash_pricing_cache', DEFAULT_SERVICE_PRICING);
    list.push(newItem);
    setCache('pickupwash_pricing_cache', list);

    authService.logAdminAction({
      action: 'create_service_pricing',
      entity_type: 'service_pricing',
      entity_id: newItem.id,
      details: { title: newItem.title, rate: newItem.rate },
    }).catch(console.warn);

    return { pricingItem: newItem };
  },

  /**
   * Admin: Update pricing item
   */
  async updatePricingItem(
    id: string,
    updates: Partial<ServicePricingRecord>
  ): Promise<{ success: boolean; pricingItem?: ServicePricingRecord; error?: string }> {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('service_pricing')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) return { success: false, error: error.message };

        authService.logAdminAction({
          action: 'update_service_pricing',
          entity_type: 'service_pricing',
          entity_id: id,
          details: cleanUpdates,
        }).catch(console.warn);

        return { success: true, pricingItem: data as ServicePricingRecord };
      } catch (err: any) {
        console.warn('Supabase updatePricingItem notice:', err);
      }
    }

    const list = getCache<ServicePricingRecord>('pickupwash_pricing_cache', DEFAULT_SERVICE_PRICING);
    let updatedObj: ServicePricingRecord | undefined;
    const updated = list.map((p) => {
      if (p.id === id) {
        updatedObj = { ...p, ...cleanUpdates };
        return updatedObj;
      }
      return p;
    });

    setCache('pickupwash_pricing_cache', updated);

    authService.logAdminAction({
      action: 'update_service_pricing',
      entity_type: 'service_pricing',
      entity_id: id,
      details: cleanUpdates,
    }).catch(console.warn);

    return { success: true, pricingItem: updatedObj };
  },

  /**
   * Admin: Toggle pricing item active/inactive status
   */
  async togglePricingStatus(id: string, is_active: boolean): Promise<boolean> {
    const res = await this.updatePricingItem(id, { is_active });
    return res.success;
  },

  /**
   * Admin: Delete pricing item
   */
  async deletePricingItem(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('service_pricing').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deletePricingItem error:', err);
      }
    }

    const list = getCache<ServicePricingRecord>('pickupwash_pricing_cache', DEFAULT_SERVICE_PRICING);
    setCache('pickupwash_pricing_cache', list.filter((p) => p.id !== id));
    return true;
  },

  // ===========================================================================
  // 3. MONTHLY PACKAGES MANAGEMENT
  // ===========================================================================

  /**
   * Public & Customer: Retrieve active monthly packages from public.monthly_packages
   */
  async getActiveMonthlyPackages(): Promise<{ packages: MonthlyPackageRecord[]; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('monthly_packages')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return { packages: data as MonthlyPackageRecord[] };
        }
      } catch (err: any) {
        console.warn('Supabase getActiveMonthlyPackages notice:', err);
      }
    }

    const all = getCache<MonthlyPackageRecord>('pickupwash_packages_cache', DEFAULT_PACKAGES);
    return { packages: all.filter((p) => p.is_active) };
  },

  /**
   * Admin: Retrieve all monthly packages (active and inactive)
   */
  async getAllMonthlyPackages(): Promise<{ packages: MonthlyPackageRecord[]; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('monthly_packages')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return { packages: data as MonthlyPackageRecord[] };
        }
      } catch (err: any) {
        console.warn('Supabase getAllMonthlyPackages notice:', err);
      }
    }

    return { packages: getCache<MonthlyPackageRecord>('pickupwash_packages_cache', DEFAULT_PACKAGES) };
  },

  /**
   * Admin: Create a new monthly package
   * IMPORTANT: price can be null (Not Set)
   */
  async createMonthlyPackage(
    packageData: Omit<MonthlyPackageRecord, 'id' | 'created_at'>
  ): Promise<{ package: MonthlyPackageRecord | null; error?: string }> {
    const slug = packageData.slug || packageData.package_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newPkg: MonthlyPackageRecord = {
      ...packageData,
      id: crypto.randomUUID ? crypto.randomUUID() : `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('monthly_packages')
          .insert([newPkg])
          .select()
          .single();

        if (error) return { package: null, error: error.message };
        if (data) {
          authService.logAdminAction({
            action: 'create_monthly_package',
            entity_type: 'monthly_package',
            entity_id: data.id,
            details: { package_name: data.package_name, price: data.price },
          }).catch(console.warn);

          return { package: data as MonthlyPackageRecord };
        }
      } catch (err: any) {
        console.warn('Supabase createMonthlyPackage notice:', err);
      }
    }

    const list = getCache<MonthlyPackageRecord>('pickupwash_packages_cache', DEFAULT_PACKAGES);
    list.push(newPkg);
    setCache('pickupwash_packages_cache', list);

    authService.logAdminAction({
      action: 'create_monthly_package',
      entity_type: 'monthly_package',
      entity_id: newPkg.id,
      details: { package_name: newPkg.package_name, price: newPkg.price },
    }).catch(console.warn);

    return { package: newPkg };
  },

  /**
   * Admin: Update an existing monthly package
   */
  async updateMonthlyPackage(
    id: string,
    updates: Partial<MonthlyPackageRecord>
  ): Promise<{ success: boolean; package?: MonthlyPackageRecord; error?: string }> {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('monthly_packages')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) return { success: false, error: error.message };

        authService.logAdminAction({
          action: 'update_monthly_package',
          entity_type: 'monthly_package',
          entity_id: id,
          details: cleanUpdates,
        }).catch(console.warn);

        return { success: true, package: data as MonthlyPackageRecord };
      } catch (err: any) {
        console.warn('Supabase updateMonthlyPackage notice:', err);
      }
    }

    const list = getCache<MonthlyPackageRecord>('pickupwash_packages_cache', DEFAULT_PACKAGES);
    let updatedObj: MonthlyPackageRecord | undefined;
    const updated = list.map((p) => {
      if (p.id === id) {
        updatedObj = { ...p, ...cleanUpdates };
        return updatedObj;
      }
      return p;
    });

    setCache('pickupwash_packages_cache', updated);

    authService.logAdminAction({
      action: 'update_monthly_package',
      entity_type: 'monthly_package',
      entity_id: id,
      details: cleanUpdates,
    }).catch(console.warn);

    return { success: true, package: updatedObj };
  },

  /**
   * Admin: Toggle monthly package active/inactive status
   */
  async togglePackageStatus(id: string, is_active: boolean): Promise<boolean> {
    const res = await this.updateMonthlyPackage(id, { is_active });
    return res.success;
  },

  // ===========================================================================
  // 4. FIRST PICKUP FREE PROMOTION MANAGEMENT
  // ===========================================================================

  /**
   * Retrieve active promotions
   */
  async getActivePromotions(): Promise<{ promotions: PromotionRecord[]; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return { promotions: data as PromotionRecord[] };
        }
      } catch (err: any) {
        console.warn('Supabase getActivePromotions notice:', err);
      }
    }

    const all = getCache<PromotionRecord>('pickupwash_promotions_cache', DEFAULT_PROMOTIONS);
    return { promotions: all.filter((p) => p.is_active) };
  },

  /**
   * Retrieve the specific 'FIRST_PICKUP_FREE' promotion record
   */
  async getFirstPickupPromotion(): Promise<PromotionRecord> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('promo_code', 'FIRST_PICKUP_FREE')
          .single();

        if (!error && data) {
          return data as PromotionRecord;
        }
      } catch (err: any) {
        console.warn('Supabase getFirstPickupPromotion notice:', err);
      }
    }

    const all = getCache<PromotionRecord>('pickupwash_promotions_cache', DEFAULT_PROMOTIONS);
    const found = all.find((p) => p.promo_code === 'FIRST_PICKUP_FREE');
    return found || DEFAULT_PROMOTIONS[0];
  },

  /**
   * Admin: Toggle promotion status (Activate or Deactivate)
   */
  async togglePromotionStatus(promoCode: string, is_active: boolean): Promise<boolean> {
    const cleanUpdates = { is_active, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('promotions')
          .update(cleanUpdates)
          .eq('promo_code', promoCode);

        if (!error) {
          authService.logAdminAction({
            action: is_active ? 'activate_promotion' : 'deactivate_promotion',
            entity_type: 'promotion',
            entity_id: promoCode,
            details: { promo_code: promoCode, is_active },
          }).catch(console.warn);

          return true;
        }
      } catch (err) {
        console.warn('Supabase togglePromotionStatus notice:', err);
      }
    }

    const list = getCache<PromotionRecord>('pickupwash_promotions_cache', DEFAULT_PROMOTIONS);
    const updated = list.map((p) => (p.promo_code === promoCode ? { ...p, ...cleanUpdates } : p));
    setCache('pickupwash_promotions_cache', updated);

    authService.logAdminAction({
      action: is_active ? 'activate_promotion' : 'deactivate_promotion',
      entity_type: 'promotion',
      entity_id: promoCode,
      details: { promo_code: promoCode, is_active },
    }).catch(console.warn);

    return true;
  },

  /**
   * Admin: Update promotion details and terms
   */
  async updatePromotion(
    promoCode: string,
    updates: Partial<PromotionRecord>
  ): Promise<{ success: boolean; promotion?: PromotionRecord; error?: string }> {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .update(cleanUpdates)
          .eq('promo_code', promoCode)
          .select()
          .single();

        if (error) return { success: false, error: error.message };

        authService.logAdminAction({
          action: 'update_promotion',
          entity_type: 'promotion',
          entity_id: promoCode,
          details: cleanUpdates,
        }).catch(console.warn);

        return { success: true, promotion: data as PromotionRecord };
      } catch (err: any) {
        console.warn('Supabase updatePromotion notice:', err);
      }
    }

    const list = getCache<PromotionRecord>('pickupwash_promotions_cache', DEFAULT_PROMOTIONS);
    let updatedObj: PromotionRecord | undefined;
    const updated = list.map((p) => {
      if (p.promo_code === promoCode) {
        updatedObj = { ...p, ...cleanUpdates };
        return updatedObj;
      }
      return p;
    });

    setCache('pickupwash_promotions_cache', updated);

    authService.logAdminAction({
      action: 'update_promotion',
      entity_type: 'promotion',
      entity_id: promoCode,
      details: cleanUpdates,
    }).catch(console.warn);

    return { success: true, promotion: updatedObj };
  },
};
