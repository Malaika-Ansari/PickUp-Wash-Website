import { supabase, isSupabaseConfigured } from './supabase';
import { bookingService } from './bookingService';
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
  return {
    id: record.id,
    trackingNumber: record.booking_reference,
    userId: record.customer_id || undefined,
    customerName: 'Customer', // Populated by caller when joining with profiles
    customerPhone: '',
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
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          return (data as BookingRecord[]).map(bookingRecordToOrder);
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
   * Admin: Update order status
   */
  async updateOrderStatus(
    trackingNumber: string,
    newStatus: OrderStatus | BookingStatus
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

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ booking_status: targetBookingStatus })
          .eq('booking_reference', trackingNumber);

        if (!error) return true;
      } catch (err) {
        console.warn('Error updating status in Supabase:', err);
      }
    }

    // Update local cache
    const raw = localStorage.getItem('pickupwash_bookings_cache');
    if (raw) {
      try {
        const list = JSON.parse(raw) as BookingRecord[];
        const updated = list.map((b) =>
          b.booking_reference === trackingNumber
            ? { ...b, booking_status: targetBookingStatus }
            : b
        );
        localStorage.setItem('pickupwash_bookings_cache', JSON.stringify(updated));
        return true;
      } catch {
        return false;
      }
    }
    return true;
  },
};
