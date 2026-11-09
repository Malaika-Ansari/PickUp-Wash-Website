import { supabase, isSupabaseConfigured } from './supabase';
import { paymentService } from './paymentService';
import { notificationService } from './notificationService';
import {
  BookingRecord,
  BookingStatusHistoryRecord,
  CreateBookingPayload,
  PolicyCheckResult,
} from '@/types';
import {
  sanitizeText,
  sanitizeReference,
  sanitizeDatabaseError,
  securityRateLimiter,
} from '@/utils/securityUtils';

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

// In-memory debounce set to prevent duplicate submissions within 5 seconds
const recentSubmissions = new Set<string>();

export const bookingService = {
  /**
   * Generates a cryptographically secure Kasur tracking reference (e.g. PW-KSR-48291)
   */
  generateBookingReference(): string {
    const randomArray = new Uint32Array(1);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randomArray);
      const suffix = 10000 + (randomArray[0] % 90000);
      return `PW-KSR-${suffix}`;
    }
    const fallbackSuffix = Math.floor(10000 + Math.random() * 90000);
    return `PW-KSR-${fallbackSuffix}`;
  },

  /**
   * Evaluates the 3-hour cancellation and rescheduling policy.
   * Business Rule: Free cancellation and rescheduling anytime within 3 hours of booking
   * and before clothes have been picked up by the rider.
   */
  checkModificationPolicy(booking: {
    created_at?: string;
    createdAt?: string;
    booking_status?: string;
    status?: string;
    pickup_date?: string;
    pickupDate?: string;
  }): PolicyCheckResult {
    const status = booking.booking_status || booking.status || 'Request Received';
    const rawCreated = booking.created_at || booking.createdAt || new Date().toISOString();
    const createdAtMs = new Date(rawCreated).getTime();
    const nowMs = Date.now();
    const msElapsed = Math.max(0, nowMs - createdAtMs);
    const hoursElapsed = msElapsed / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 3 - hoursElapsed);

    // Format human-readable remaining time
    const minutesRemaining = Math.ceil(hoursRemaining * 60);
    let timeRemainingFormatted = '';
    if (minutesRemaining >= 60) {
      const h = Math.floor(minutesRemaining / 60);
      const m = minutesRemaining % 60;
      timeRemainingFormatted = `${h}h ${m}m remaining`;
    } else {
      timeRemainingFormatted = `${minutesRemaining}m remaining`;
    }

    // 1. If clothes already collected or in advanced process, cannot modify automatically
    if (
      status === 'Picked Up' ||
      status === 'Clothes Picked Up' ||
      status === 'picked_up' ||
      status === 'Washing & Ironing' ||
      status === 'processing' ||
      status === 'ironing' ||
      status === 'Ready for Delivery' ||
      status === 'ready_for_delivery' ||
      status === 'out_for_delivery' ||
      status === 'Delivered' ||
      status === 'delivered'
    ) {
      return {
        canCancel: false,
        canReschedule: false,
        reason:
          'Clothes have already been collected by our rider. Automated modifications are closed. Please contact Pickup Wash support directly.',
        hoursElapsed,
        hoursRemaining: 0,
        timeRemainingFormatted: 'Window closed',
      };
    }

    // 2. If already cancelled
    if (status === 'Cancelled' || status === 'cancelled') {
      return {
        canCancel: false,
        canReschedule: false,
        reason: 'This booking has already been cancelled.',
        hoursElapsed,
        hoursRemaining: 0,
        timeRemainingFormatted: 'Cancelled',
      };
    }

    // 3. Check 3-hour policy window
    if (hoursElapsed <= 3) {
      return {
        canCancel: true,
        canReschedule: true,
        hoursElapsed,
        hoursRemaining,
        timeRemainingFormatted,
      };
    }

    // 4. Outside 3-hour window
    return {
      canCancel: false,
      canReschedule: false,
      reason: `The 3-hour self-service modification window has expired (booked ${hoursElapsed.toFixed(
        1
      )} hours ago). To request changes, please call or WhatsApp support at +92 300 1234567.`,
      hoursElapsed,
      hoursRemaining: 0,
      timeRemainingFormatted: 'Window expired',
    };
  },

  /**
   * Creates a new doorstep booking record in public.bookings.
   * Auto-triggers initial status logging in public.booking_status_history.
   */
  async createBooking(
    payload: CreateBookingPayload,
    authenticatedUserId?: string
  ): Promise<{ success: boolean; booking?: BookingRecord; error?: string }> {
    // Security check: Customer can only submit bookings under their own authenticated account
    if (authenticatedUserId && payload.customer_id && payload.customer_id !== authenticatedUserId) {
      return {
        success: false,
        error: 'Security Notice: You cannot create bookings on behalf of another customer account.',
      };
    }

    // Input Sanitization: Strip dangerous HTML/scripts and enforce bounds
    const cleanAddress = sanitizeText(payload.pickup_address, 250);
    const cleanArea = sanitizeText(payload.area, 100);
    const cleanInstructions = payload.special_instructions ? sanitizeText(payload.special_instructions, 500) : null;
    const cleanBookingRef = sanitizeReference(payload.booking_reference) || this.generateBookingReference();

    // Prevent duplicate rapid submissions (within 5 seconds)
    const submissionFingerprint = `${payload.customer_id || 'guest'}_${payload.pickup_date}_${payload.pickup_time}_${cleanAddress}`;
    if (recentSubmissions.has(submissionFingerprint)) {
      return {
        success: false,
        error: 'Duplicate request detected. Please wait a moment before submitting again.',
      };
    }
    recentSubmissions.add(submissionFingerprint);
    setTimeout(() => recentSubmissions.delete(submissionFingerprint), 5000);

    // Rate Limiting check
    const rateCheck = securityRateLimiter.checkLimit('booking_submit', payload.customer_id || 'guest');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Submission limit reached. Please wait ${rateCheck.retryAfterSeconds} seconds before creating another booking.`,
      };
    }

    const newRecord: BookingRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      customer_id: payload.customer_id || null,
      booking_reference: cleanBookingRef,
      service_type: payload.service_type,
      pickup_address: cleanAddress,
      area: cleanArea,
      pickup_date: payload.pickup_date,
      pickup_time: payload.pickup_time,
      special_instructions: cleanInstructions,
      payment_method: payload.payment_method || 'Cash on Delivery',
      payment_status: 'Pending',
      booking_status: 'Request Received',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        securityRateLimiter.recordAttempt('booking_submit', payload.customer_id || 'guest');

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
              booking_status: 'Request Received',
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase booking creation error:', error.message);
          return {
            success: false,
            error: sanitizeDatabaseError(error),
          };
        }

        const inserted = data as BookingRecord;
        // Cache locally for immediate UI availability
        const local = getLocalBookings();
        saveLocalBookings([inserted, ...local]);

        // Automatically initialize associated payment record in public.payments
        try {
          await paymentService.createPaymentRecord({
            booking_id: inserted.id,
            customer_id: inserted.customer_id,
            payment_method: inserted.payment_method,
            payment_amount: null, // Nullable until confirmed
            payment_status: 'Pending',
          });
        } catch (paymentErr) {
          console.warn('Initial payment record creation notice:', paymentErr);
        }

        // Generate in-app customer notification
        if (inserted.customer_id) {
          try {
            await notificationService.notifyBookingCreated(inserted);
          } catch (notifErr) {
            console.warn('Notification trigger notice:', notifErr);
          }
        }

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

    // Local payment record creation
    try {
      paymentService.createPaymentRecord({
        booking_id: newRecord.id,
        customer_id: newRecord.customer_id,
        payment_method: newRecord.payment_method,
        payment_amount: null,
        payment_status: 'Pending',
      });
    } catch (e) {
      console.warn('Local payment record fallback notice:', e);
    }

    // Local notification creation
    if (newRecord.customer_id) {
      try {
        notificationService.notifyBookingCreated(newRecord);
      } catch (e) {
        console.warn('Local notification fallback notice:', e);
      }
    }

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
          console.warn('Error reading booking_status_history from Supabase:', error.message);
        } else if (data && data.length > 0) {
          return { history: data as BookingStatusHistoryRecord[] };
        }
      } catch (err: any) {
        console.warn('Network issue reading booking_status_history:', err);
      }
    }

    // Fallback to local history cache
    try {
      const raw = localStorage.getItem('pickupwash_status_history_cache');
      if (raw) {
        const list = JSON.parse(raw) as BookingStatusHistoryRecord[];
        const matched = list.filter((h) => h.booking_id === bookingId);
        if (matched.length > 0) {
          return { history: matched.sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()) };
        }
      }
    } catch {
      // Ignore cache parse error
    }

    return { history: [] };
  },

  /**
   * Request Booking Cancellation within 3-hour policy.
   * Enforces business rules: only approved if within 3 hours and clothes not yet collected.
   */
  async requestCancellation(
    bookingId: string,
    customerId: string,
    reason: string = 'Customer requested cancellation.'
  ): Promise<{ success: boolean; approved: boolean; message: string; error?: string }> {
    // 1. Fetch current booking to evaluate policy
    const { booking, error: fetchError } = await this.getBookingById(bookingId);
    if (fetchError || !booking) {
      return {
        success: false,
        approved: false,
        message: 'Could not locate booking record.',
        error: fetchError || 'Booking not found.',
      };
    }

    // 2. Evaluate 3-hour policy
    const policy = this.checkModificationPolicy(booking);
    if (!policy.canCancel) {
      return {
        success: false,
        approved: false,
        message: policy.reason || 'Cancellation window has closed.',
      };
    }

    // 3. Perform cancellation in database
    const cancelledAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({
            booking_status: 'Cancelled',
            cancellation_reason: reason.trim(),
            cancelled_at: cancelledAt,
          })
          .eq('id', bookingId)
          .eq('customer_id', customerId);

        if (error) {
          return {
            success: false,
            approved: false,
            message: error.message || 'Database update failed.',
            error: error.message,
          };
        }

        // Refresh local cache
        const local = getLocalBookings();
        const updated = local.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                booking_status: 'Cancelled' as const,
                cancellation_reason: reason,
                cancelled_at: cancelledAt,
              }
            : b
        );
        saveLocalBookings(updated);

        // In-app cancellation notification
        if (booking.customer_id) {
          notificationService.notifyBookingStatusUpdated(
            { ...booking, cancellation_reason: reason },
            'Cancelled'
          ).catch((e) => console.warn('Cancel notif error:', e));
        }

        return {
          success: true,
          approved: true,
          message: 'Your booking has been cancelled successfully.',
        };
      } catch (err: any) {
        return {
          success: false,
          approved: false,
          message: err.message || 'An error occurred while cancelling booking.',
          error: err.message,
        };
      }
    }

    // Local fallback
    const local = getLocalBookings();
    const updated = local.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            booking_status: 'Cancelled' as const,
            cancellation_reason: reason,
            cancelled_at: cancelledAt,
          }
        : b
    );
    saveLocalBookings(updated);

    if (booking.customer_id) {
      notificationService.notifyBookingStatusUpdated(
        { ...booking, cancellation_reason: reason },
        'Cancelled'
      ).catch((e) => console.warn('Cancel notif error:', e));
    }

    return {
      success: true,
      approved: true,
      message: 'Your booking has been cancelled successfully.',
    };
  },

  /**
   * Request Booking Rescheduling within 3-hour policy.
   * Enforces business rules: only approved if within 3 hours and clothes not yet collected.
   */
  async requestReschedule(
    bookingId: string,
    customerId: string,
    newDate: string,
    newTime: string,
    reason?: string
  ): Promise<{ success: boolean; approved: boolean; message: string; error?: string }> {
    // 1. Fetch current booking to evaluate policy
    const { booking, error: fetchError } = await this.getBookingById(bookingId);
    if (fetchError || !booking) {
      return {
        success: false,
        approved: false,
        message: 'Could not locate booking record.',
        error: fetchError || 'Booking not found.',
      };
    }

    // 2. Evaluate 3-hour policy
    const policy = this.checkModificationPolicy(booking);
    if (!policy.canReschedule) {
      return {
        success: false,
        approved: false,
        message: policy.reason || 'Rescheduling window has closed.',
      };
    }

    // 3. Validate new pickup date is not in past
    const today = new Date().toISOString().split('T')[0];
    if (newDate < today) {
      return {
        success: false,
        approved: false,
        message: 'New pickup date cannot be in the past.',
      };
    }

    const rescheduledAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({
            pickup_date: newDate,
            pickup_time: newTime,
            rescheduled_date: newDate,
            rescheduled_time: newTime,
            reschedule_reason: reason?.trim() || 'Customer requested reschedule within policy window.',
            rescheduled_at: rescheduledAt,
          })
          .eq('id', bookingId)
          .eq('customer_id', customerId);

        if (error) {
          return {
            success: false,
            approved: false,
            message: error.message || 'Database update failed.',
            error: error.message,
          };
        }

        // Refresh local cache
        const local = getLocalBookings();
        const updated = local.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                pickup_date: newDate,
                pickup_time: newTime,
                rescheduled_date: newDate,
                rescheduled_time: newTime,
                reschedule_reason: reason,
                rescheduled_at: rescheduledAt,
              }
            : b
        );
        saveLocalBookings(updated);

        // In-app reschedule notification
        if (booking.customer_id) {
          notificationService.notifyBookingRescheduled({
            ...booking,
            pickup_date: newDate,
            pickup_time: newTime,
          }).catch((e) => console.warn('Reschedule notif error:', e));
        }

        return {
          success: true,
          approved: true,
          message: `Pickup has been rescheduled to ${newDate} (${newTime}).`,
        };
      } catch (err: any) {
        return {
          success: false,
          approved: false,
          message: err.message || 'An error occurred while rescheduling pickup.',
          error: err.message,
        };
      }
    }

    // Local fallback
    const local = getLocalBookings();
    const updated = local.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            pickup_date: newDate,
            pickup_time: newTime,
            rescheduled_date: newDate,
            rescheduled_time: newTime,
            reschedule_reason: reason,
            rescheduled_at: rescheduledAt,
          }
        : b
    );
    saveLocalBookings(updated);

    if (booking.customer_id) {
      notificationService.notifyBookingRescheduled({
        ...booking,
        pickup_date: newDate,
        pickup_time: newTime,
      }).catch((e) => console.warn('Reschedule notif error:', e));
    }

    return {
      success: true,
      approved: true,
      message: `Pickup has been rescheduled to ${newDate} (${newTime}).`,
    };
  },
};
