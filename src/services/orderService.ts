import { supabase, isSupabaseConfigured } from './supabase';
import { bookingService } from './bookingService';
import { notificationService } from './notificationService';
import { authService } from './authService';
import {
  BookingFormData,
  Order,
  OrderStatus,
  BookingStatus,
  BookingRecord,
  PaymentMethod,
} from '@/types';

// Map database booking_status to OrderStatus for backward and forward compatibility
const mapBookingStatusToLegacy = (status: BookingStatus | string): OrderStatus => {
  switch (status) {
    case 'Request Received':
    case 'Booking Request Received':
    case 'pending_pickup':
      return 'Request Received';
    case 'Confirmed':
    case 'Booking Confirmed':
      return 'Confirmed';
    case 'Picked Up':
    case 'Clothes Picked Up':
    case 'picked_up':
      return 'Picked Up';
    case 'Washing & Ironing':
    case 'processing':
    case 'ironing':
      return 'Washing & Ironing';
    case 'Ready for Delivery':
    case 'ready_for_delivery':
    case 'out_for_delivery':
      return 'Ready for Delivery';
    case 'Delivered':
    case 'delivered':
      return 'Delivered';
    case 'Cancelled':
    case 'cancelled':
      return 'Cancelled';
    default:
      return (status as OrderStatus) || 'Request Received';
  }
};

// Convert BookingRecord to Order interface
const bookingRecordToOrder = (record: BookingRecord): Order => {
  const profileData = (record as any).profiles;
  return {
    id: record.id,
    trackingNumber: record.booking_reference,
    userId: record.customer_id || undefined,
    customerName: profileData?.full_name || (record as any).customer_name || 'Customer',
    customerPhone: profileData?.phone || (record as any).customer_phone || '',
    customerEmail: profileData?.email || (record as any).customer_email || undefined,
    pickupAddress: record.pickup_address,
    area: record.area,
    pickupDate: record.pickup_date,
    pickupTimeSlot: record.pickup_time,
    status: mapBookingStatusToLegacy(record.booking_status),
    bookingStatus: record.booking_status,
    items: [
      {
        serviceId: record.service_type.toLowerCase().replace(/\s+/g, '-'),
        serviceTitle: record.service_type,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ],
    totalAmount: 0,
    specialInstructions: record.special_instructions || undefined,
    paymentMethod: record.payment_method,
    paymentStatus: record.payment_status,
    cancellationReason: record.cancellation_reason || undefined,
    cancelledAt: record.cancelled_at || undefined,
    rescheduledDate: record.rescheduled_date || undefined,
    rescheduledTime: record.rescheduled_time || undefined,
    rescheduleReason: record.reschedule_reason || undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
};

export const orderService = {
  /**
   * Generates tracking reference code
   */
  generateTrackingCode(): string {
    return bookingService.generateBookingReference();
  },

  /**
   * Create an order/booking in the database
   */
  async createOrder(
    data: BookingFormData,
    userId?: string
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    const serviceNameMap: Record<string, string> = {
      'wash-and-iron': 'Wash & Iron',
      'express-service': 'Express Service',
      'monthly-packages': 'Monthly Package',
      'iron-only': 'Iron Only',
      'bedding-and-household': 'Bedding & Household',
    };

    const resolvedServiceType =
      serviceNameMap[data.serviceId] || data.serviceId || 'Wash & Iron';

    // Normalize payment method to standard database check constraint
    let resolvedPaymentMethod: PaymentMethod = 'Cash on Delivery';
    if (data.paymentMethod === 'easypaisa_jazzcash') {
      resolvedPaymentMethod = 'JazzCash';
    } else if (data.paymentMethod === 'bank_transfer') {
      resolvedPaymentMethod = 'Bank Transfer';
    } else if (
      data.paymentMethod === 'JazzCash' ||
      data.paymentMethod === 'Easypaisa' ||
      data.paymentMethod === 'Bank Transfer'
    ) {
      resolvedPaymentMethod = data.paymentMethod;
    }

    const pickupAddress = data.streetAddress
      ? `${data.streetAddress}${data.landmark ? ` (Near ${data.landmark})` : ''}`
      : 'Kasur City';

    const result = await bookingService.createBooking({
      customer_id: userId || null,
      service_type: resolvedServiceType,
      pickup_address: pickupAddress,
      area: data.area,
      pickup_date: data.pickupDate,
      pickup_time: data.pickupTimeSlot,
      special_instructions: data.specialInstructions || null,
      payment_method: resolvedPaymentMethod,
    });

    if (!result.success || !result.booking) {
      return { success: false, error: result.error || 'Failed to submit booking.' };
    }

    const order = bookingRecordToOrder(result.booking);
    order.customerName = data.fullName;
    order.customerPhone = data.phoneNumber;

    return { success: true, order };
  },

  /**
   * Query single order by tracking/booking reference
   */
  async getOrderByTracking(
    trackingNumber: string,
    phoneVerification?: string
  ): Promise<Order | null> {
    const result = await bookingService.getBookingByReference(
      trackingNumber,
      phoneVerification
    );

    if (!result.booking) {
      return null;
    }

    return bookingRecordToOrder(result.booking);
  },

  /**
   * Query customer orders/bookings
   */
  async getCustomerOrders(
    userId?: string,
    customerPhone?: string,
    _customerEmail?: string
  ): Promise<Order[]> {
    if (!userId) {
      return [];
    }

    const result = await bookingService.getCustomerBookings(userId);
    return result.bookings.map((b) => {
      const order = bookingRecordToOrder(b);
      if (customerPhone) {
        order.customerPhone = customerPhone;
      }
      return order;
    });
  },

  /**
   * Admin: Query all bookings
   */
  async getAllOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, profiles:customer_id(full_name, phone, email)')
          .order('created_at', { ascending: false });

        if (data && !error) {
          return (data as any[]).map(bookingRecordToOrder);
        }
      } catch (err) {
        console.warn('Error fetching all orders from Supabase:', err);
      }
    }

    // Local cache fallback
    const raw = localStorage.getItem('pickupwash_bookings_cache');
    if (raw) {
      try {
        const list = JSON.parse(raw) as BookingRecord[];
        return list.map(bookingRecordToOrder);
      } catch {
        return [];
      }
    }
    return [];
  },

  /**
   * Admin: Update order status, record cancellation reason and log status history
   */
  async updateOrderStatus(
    trackingNumber: string,
    newStatus: OrderStatus | BookingStatus,
    cancellationReason?: string,
    adminNotes?: string
  ): Promise<boolean> {
    const statusMap: Record<string, BookingStatus> = {
      pending_pickup: 'Booking Request Received',
      picked_up: 'Clothes Picked Up',
      processing: 'Washing & Ironing',
      ironing: 'Washing & Ironing',
      ready_for_delivery: 'Ready for Delivery',
      out_for_delivery: 'Ready for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    const targetBookingStatus: BookingStatus =
      statusMap[newStatus] || (newStatus as BookingStatus);

    let targetBooking: BookingRecord | null = null;
    let prevStatus = 'Request Received';

    if (isSupabaseConfigured()) {
      try {
        const updatePayload: any = {
          booking_status: targetBookingStatus,
          updated_at: new Date().toISOString(),
        };

        if (targetBookingStatus === 'Cancelled' && cancellationReason) {
          updatePayload.cancellation_reason = cancellationReason.trim();
          updatePayload.cancelled_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('bookings')
          .update(updatePayload)
          .eq('booking_reference', trackingNumber)
          .select()
          .single();

        if (!error && data) {
          targetBooking = data as BookingRecord;
        }
      } catch (err) {
        console.warn('Error updating status in Supabase:', err);
      }
    }

    // Update local cache
    const raw = localStorage.getItem('pickupwash_bookings_cache');
    if (raw) {
      try {
        const list = JSON.parse(raw) as BookingRecord[];
        const updated = list.map((b) => {
          if (b.booking_reference === trackingNumber) {
            prevStatus = b.booking_status;
            const updatedBooking: BookingRecord = {
              ...b,
              booking_status: targetBookingStatus,
              ...(targetBookingStatus === 'Cancelled' && cancellationReason
                ? {
                    cancellation_reason: cancellationReason.trim(),
                    cancelled_at: new Date().toISOString(),
                  }
                : {}),
              updated_at: new Date().toISOString(),
            };
            if (!targetBooking) targetBooking = updatedBooking;
            return updatedBooking;
          }
          return b;
        });
        localStorage.setItem('pickupwash_bookings_cache', JSON.stringify(updated));
      } catch (e) {
        console.warn('Local cache update notice:', e);
      }
    }

    // Record local status history cache (for offline/test environments)
    if (targetBooking) {
      try {
        const histRaw = localStorage.getItem('pickupwash_status_history_cache');
        const histList = histRaw ? JSON.parse(histRaw) : [];
        histList.push({
          id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          booking_id: targetBooking.id,
          previous_status: prevStatus,
          new_status: targetBookingStatus,
          changed_at: new Date().toISOString(),
          notes:
            targetBookingStatus === 'Cancelled' && cancellationReason
              ? `Cancellation Reason: ${cancellationReason}`
              : adminNotes || `Status updated from ${prevStatus} to ${targetBookingStatus}`,
        });
        localStorage.setItem('pickupwash_status_history_cache', JSON.stringify(histList));
      } catch (e) {
        console.warn('Local history cache error:', e);
      }
    }

    // Trigger in-app notification for the customer
    if (targetBooking && targetBooking.customer_id) {
      try {
        if (cancellationReason) {
          targetBooking.cancellation_reason = cancellationReason;
        }
        notificationService.notifyBookingStatusUpdated(targetBooking, targetBookingStatus);
      } catch (notifErr) {
        console.warn('Status notification error:', notifErr);
      }
    }

    // Record administrative audit trail
    authService.logAdminAction({
      action: 'update_order_status',
      entity_type: 'booking',
      entity_id: trackingNumber,
      details: {
        previous_status: prevStatus,
        new_status: targetBookingStatus,
        booking_reference: trackingNumber,
        cancellation_reason: cancellationReason || undefined,
        notes: adminNotes || undefined,
      },
    }).catch((e) => console.warn('Order status audit log notice:', e));

    return true;
  },
};
