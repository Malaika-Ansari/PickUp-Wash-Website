import { supabase, isSupabaseConfigured } from './supabase';
import {
  BookingRecord,
  BookingStatusHistoryRecord,
  CreateBookingPayload,
} from '@/types';

const LOCAL_STORAGE_BOOKINGS_KEY = 'pickupwash_bookings_cache';

// Helper for local storage persistence in development/offline mode
const getLocalBookings = (): BookingRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalBookings = (list: BookingRecord[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error writing to local booking cache:', e);
  }
};

export const bookingService = {
  /**
   * Generates a standard Kasur tracking reference (e.g. PW-KSR-48291)
   */
  generateBookingReference(): string {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `PW-KSR-${randomSuffix}`;
  },

  /**
   * Creates a new doorstep booking record in public.bookings.
   * Auto-triggers initial status logging in public.booking_status_history.
   */
  async createBooking(
    payload: CreateBookingPayload
  ): Promise<{ success: boolean; booking?: BookingRecord; error?: string }> {
    const bookingReference =
      payload.booking_reference || this.generateBookingReference();

    const newRecord: BookingRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      customer_id: payload.customer_id || null,
      booking_reference: bookingReference,
      service_type: payload.service_type,
      pickup_address: payload.pickup_address,
      area: payload.area,
      pickup_date: payload.pickup_date,
      pickup_time: payload.pickup_time,
      special_instructions: payload.special_instructions || null,
      payment_method: payload.payment_method || 'Cash on Delivery',
      payment_status: 'pending',
      booking_status: 'Booking Request Received',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert([
            {
              customer_id: newRecord.customer_id,
              booking_reference: newRecord.booking_reference,
              service_type: newRecord.service_type,
              pickup_address: newRecord.pickup_address,
              area: newRecord.area,
              pickup_date: newRecord.pickup_date,
              pickup_time: newRecord.pickup_time,
              special_instructions: newRecord.special_instructions,
              payment_method: newRecord.payment_method,
              payment_status: newRecord.payment_status,
              booking_status: newRecord.booking_status,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase booking creation error:', error.message);
          return {
            success: false,
            error: error.message || 'Failed to submit booking request to the database.',
          };
        }

        const inserted = data as BookingRecord;
        // Cache locally for immediate UI availability
        const local = getLocalBookings();
        saveLocalBookings([inserted, ...local]);

        return { success: true, booking: inserted };
      } catch (err: any) {
        console.error('Network error reaching Supabase:', err);
        return {
          success: false,
          error:
            err.message ||
            'Network connectivity issue while reaching database. Please check your connection.',
        };
      }
    }

    // Local fallback for offline/development mode when Supabase credentials are not yet configured
    const local = getLocalBookings();
    saveLocalBookings([newRecord, ...local]);
    return { success: true, booking: newRecord };
  },

  /**
   * Fetch all bookings belonging to an authenticated customer.
   * Respects RLS: auth.uid() must match customer_id.
   */
  async getCustomerBookings(
    customerId: string
  ): Promise<{ bookings: BookingRecord[]; error?: string }> {
    if (!customerId) {
      return { bookings: [] };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching bookings from Supabase:', error.message);
          return { bookings: [], error: error.message };
        }

        const list = (data as BookingRecord[]) || [];
        // Update local cache
        saveLocalBookings(list);
        return { bookings: list };
      } catch (err: any) {
        console.warn('Network error fetching customer bookings:', err);
        return {
          bookings: [],
          error: err.message || 'Unable to load bookings due to a network error.',
        };
      }
    }

    // Offline / unconfigured mode fallback
    const local = getLocalBookings();
    const filtered = local.filter((b) => b.customer_id === customerId);
    return { bookings: filtered };
  },

  /**
   * Fetch individual booking by ID.
   */
  async getBookingById(
    bookingId: string
  ): Promise<{ booking: BookingRecord | null; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error) {
          return { booking: null, error: error.message };
        }

        return { booking: data as BookingRecord };
      } catch (err: any) {
        return { booking: null, error: err.message };
      }
    }

    const local = getLocalBookings();
    const match = local.find((b) => b.id === bookingId);
    return { booking: match || null };
  },

  /**
   * Secure booking tracking lookup.
   * Uses RPC function 'track_booking_secure' or direct lookup if authenticated owner.
   */
  async getBookingByReference(
    reference: string,
    phoneVerification?: string
  ): Promise<{ booking: BookingRecord | null; error?: string }> {
    const cleanRef = reference.trim().toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        // Attempt secure RPC tracking first
        if (phoneVerification) {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'track_booking_secure',
            {
              p_booking_reference: cleanRef,
              p_phone: phoneVerification.trim(),
            }
          );

          if (!rpcError && rpcData && rpcData.length > 0) {
            const raw = rpcData[0];
            return {
              booking: {
                id: raw.id,
                customer_id: null,
                booking_reference: raw.booking_reference,
                service_type: raw.service_type,
                pickup_address: raw.pickup_address,
                area: raw.area,
                pickup_date: raw.pickup_date,
                pickup_time: raw.pickup_time,
                special_instructions: null,
                payment_method: 'Cash on Delivery',
                payment_status: 'pending',
                booking_status: raw.booking_status,
                created_at: raw.created_at,
                updated_at: raw.updated_at,
              },
            };
          }
        }

        // Direct select fallback for authenticated customer query
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('booking_reference', cleanRef)
          .single();

        if (data && !error) {
          return { booking: data as BookingRecord };
        }

        if (error && error.code !== 'PGRST116') {
          // PGRST116 means 0 rows returned
          return { booking: null, error: error.message };
        }
      } catch (err: any) {
        console.warn('Error querying Supabase for booking reference:', err);
      }
    }

    // Fallback to local storage
    const local = getLocalBookings();
    const match = local.find(
      (b) => b.booking_reference.toUpperCase() === cleanRef
    );
    return { booking: match || null };
  },

  /**
   * Retrieve the lifecycle audit history of a booking from public.booking_status_history.
   */
  async getBookingStatusHistory(
    bookingId: string
  ): Promise<{ history: BookingStatusHistoryRecord[]; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('booking_status_history')
          .select('*')
          .eq('booking_id', bookingId)
          .order('changed_at', { ascending: true });

        if (error) {
          return { history: [], error: error.message };
        }

        return { history: (data as BookingStatusHistoryRecord[]) || [] };
      } catch (err: any) {
        return { history: [], error: err.message };
      }
    }

    return { history: [] };
  },

  /**
   * Allows customer to cancel their own booking if still in 'Booking Request Received' stage.
   */
  async cancelBooking(
    bookingId: string,
    customerId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ booking_status: 'Cancelled' })
          .eq('id', bookingId)
          .eq('customer_id', customerId)
          .eq('booking_status', 'Booking Request Received');

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Local fallback
    const local = getLocalBookings();
    const updated = local.map((b) =>
      b.id === bookingId ? { ...b, booking_status: 'Cancelled' as const } : b
    );
    saveLocalBookings(updated);
    return { success: true };
  },
};
