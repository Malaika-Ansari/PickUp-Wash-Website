import { supabase, isSupabaseConfigured } from './supabase';
import {
  PaymentRecord,
  CreatePaymentPayload,
  PaymentStatus,
  normalizePaymentStatus,
} from '@/types';

const LOCAL_STORAGE_PAYMENTS_KEY = 'pickupwash_payments_cache';

const getLocalPayments = (): PaymentRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalPayments = (list: PaymentRecord[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error writing to local payments cache:', e);
  }
};

export const paymentService = {
  /**
   * Creates an initial payment record associated with a booking.
   * Payment amount is kept nullable until actual rates are confirmed.
   */
  async createPaymentRecord(
    payload: CreatePaymentPayload
  ): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
    const initialStatus: PaymentStatus = payload.transaction_reference
      ? 'Awaiting Verification'
      : 'Pending';

    const newPayment: PaymentRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      booking_id: payload.booking_id,
      customer_id: payload.customer_id || null,
      payment_method: payload.payment_method,
      payment_amount: payload.payment_amount ?? null, // Nullable until confirmed
      payment_status: initialStatus,
      transaction_reference: payload.transaction_reference?.trim() || null,
      payment_notes: payload.payment_notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert([
            {
              booking_id: newPayment.booking_id,
              customer_id: newPayment.customer_id,
              payment_method: newPayment.payment_method,
              payment_amount: newPayment.payment_amount,
              payment_status: newPayment.payment_status,
              transaction_reference: newPayment.transaction_reference,
              payment_notes: newPayment.payment_notes,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase payment record creation error:', error.message);
          return {
            success: false,
            error: error.message || 'Failed to create payment record in database.',
          };
        }

        const inserted = data as PaymentRecord;
        const local = getLocalPayments();
        saveLocalPayments([inserted, ...local]);

        return { success: true, payment: inserted };
      } catch (err: any) {
        console.error('Network error creating payment record:', err);
        return {
          success: false,
          error: err.message || 'Network error reaching payment database.',
        };
      }
    }

    // Local development fallback
    const local = getLocalPayments();
    saveLocalPayments([newPayment, ...local]);
    return { success: true, payment: newPayment };
  },

  /**
   * Fetch payment record by booking ID.
   * Respects RLS: Customers can only fetch their own bookings.
   */
  async getPaymentByBookingId(
    bookingId: string
  ): Promise<{ payment: PaymentRecord | null; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('booking_id', bookingId)
          .maybeSingle();

        if (error) {
          return { payment: null, error: error.message };
        }

        return { payment: (data as PaymentRecord) || null };
      } catch (err: any) {
        return { payment: null, error: err.message };
      }
    }

    const local = getLocalPayments();
    const match = local.find((p) => p.booking_id === bookingId);
    return { payment: match || null };
  },

  /**
   * Fetch all payment records for an authenticated customer.
   */
  async getCustomerPayments(
    customerId: string
  ): Promise<{ payments: PaymentRecord[]; error?: string }> {
    if (!customerId) return { payments: [] };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) {
          return { payments: [], error: error.message };
        }

        return { payments: (data as PaymentRecord[]) || [] };
      } catch (err: any) {
        return { payments: [], error: err.message };
      }
    }

    const local = getLocalPayments();
    const filtered = local.filter((p) => p.customer_id === customerId);
    return { payments: filtered };
  },

  /**
   * Customer submits transaction reference for JazzCash / Easypaisa / Bank Transfer.
   * Security Rule: Moves status to 'Awaiting Verification' ONLY. Customers CANNOT mark as 'Paid'.
   */
  async submitTransactionReference(
    paymentId: string,
    customerId?: string | null,
    transactionReference?: string,
    notes?: string
  ): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
    const cleanRef = transactionReference?.trim();
    if (!cleanRef) {
      return { success: false, error: 'Transaction reference / ID is required.' };
    }

    const updatedAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('payments')
          .update({
            transaction_reference: cleanRef,
            payment_notes: notes?.trim() || null,
            payment_status: 'Awaiting Verification',
            updated_at: updatedAt,
          })
          .eq('id', paymentId);

        if (customerId) {
          query = query.eq('customer_id', customerId);
        }

        const { data, error } = await query.select().single();

        if (error) {
          return {
            success: false,
            error: error.message || 'Failed to submit transaction reference for verification.',
          };
        }

        const updated = data as PaymentRecord;
        const local = getLocalPayments();
        saveLocalPayments(local.map((p) => (p.id === paymentId ? updated : p)));

        return { success: true, payment: updated };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Network error submitting transaction reference.',
        };
      }
    }

    // Local fallback
    const local = getLocalPayments();
    const target = local.find((p) => p.id === paymentId);
    if (!target) {
      return { success: false, error: 'Payment record not found.' };
    }

    const updated: PaymentRecord = {
      ...target,
      transaction_reference: cleanRef,
      payment_notes: notes?.trim() || target.payment_notes,
      payment_status: 'Awaiting Verification',
      updated_at: updatedAt,
    };

    saveLocalPayments(local.map((p) => (p.id === paymentId ? updated : p)));
    return { success: true, payment: updated };
  },

  /**
   * Administrator: Query all payment records across the platform.
   */
  async getAllPayments(): Promise<{ payments: PaymentRecord[]; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return { payments: [], error: error.message };
        }

        return { payments: (data as PaymentRecord[]) || [] };
      } catch (err: any) {
        return { payments: [], error: err.message };
      }
    }

    const local = getLocalPayments();
    return { payments: local };
  },

  /**
   * Administrator: Verify payment record and update status.
   * Security Rule: Only authorized administrators can mark as 'Paid', 'Failed', or 'Refunded'.
   */
  async verifyPayment(
    paymentId: string,
    adminId: string,
    status: PaymentStatus,
    transactionReference?: string,
    notes?: string,
    amount?: number | null
  ): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
    const verifiedAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const updates: any = {
          payment_status: status,
          verified_by: adminId,
          verified_at: verifiedAt,
          updated_at: verifiedAt,
        };

        if (transactionReference !== undefined) {
          updates.transaction_reference = transactionReference?.trim() || null;
        }
        if (notes !== undefined) {
          updates.payment_notes = notes?.trim() || null;
        }
        if (amount !== undefined) {
          updates.payment_amount = amount;
        }

        const { data, error } = await supabase
          .from('payments')
          .update(updates)
          .eq('id', paymentId)
          .select()
          .single();

        if (error) {
          return {
            success: false,
            error: error.message || 'Administrative verification failed in database.',
          };
        }

        const updated = data as PaymentRecord;
        const local = getLocalPayments();
        saveLocalPayments(local.map((p) => (p.id === paymentId ? updated : p)));

        return { success: true, payment: updated };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Error occurred during payment verification.',
        };
      }
    }

    // Local fallback
    const local = getLocalPayments();
    const target = local.find((p) => p.id === paymentId);
    if (!target) {
      return { success: false, error: 'Payment record not found.' };
    }

    const updated: PaymentRecord = {
      ...target,
      payment_status: status,
      verified_by: adminId,
      verified_at: verifiedAt,
      transaction_reference:
        transactionReference !== undefined
          ? transactionReference?.trim() || null
          : target.transaction_reference,
      payment_notes: notes !== undefined ? notes?.trim() || null : target.payment_notes,
      payment_amount: amount !== undefined ? amount : target.payment_amount,
      updated_at: verifiedAt,
    };

    saveLocalPayments(local.map((p) => (p.id === paymentId ? updated : p)));
    return { success: true, payment: updated };
  },
};
