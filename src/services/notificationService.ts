import { supabase, isSupabaseConfigured } from './supabase';
import {
  NotificationRecord,
  CreateNotificationPayload,
  NotificationType,
  BookingRecord,
  PaymentRecord,
} from '@/types';
import {
  notificationDispatcher,
  ChannelMessage,
} from './notificationChannels';

const LOCAL_STORAGE_NOTIFICATIONS_KEY = 'pickupwash_notifications_cache';

const getLocalNotifications = (): NotificationRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalNotifications = (list: NotificationRecord[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error writing to local notifications cache:', e);
  }
};

export const notificationService = {
  /**
   * Fetch all notifications for an authenticated customer, ordered by newest first.
   * Supabase Row Level Security restricts rows to auth.uid() = customer_id.
   */
  async getCustomerNotifications(
    customerId: string
  ): Promise<{ notifications: NotificationRecord[]; error?: string }> {
    if (!customerId) return { notifications: [] };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase notifications fetch error, using local cache:', error.message);
          const local = getLocalNotifications().filter((n) => n.customer_id === customerId);
          return { notifications: local };
        }

        const list = (data as NotificationRecord[]) || [];
        // Keep local cache in sync
        const otherCustomers = getLocalNotifications().filter((n) => n.customer_id !== customerId);
        saveLocalNotifications([...list, ...otherCustomers]);

        return { notifications: list };
      } catch (err: any) {
        console.warn('Network error loading notifications, using fallback:', err.message);
        const local = getLocalNotifications().filter((n) => n.customer_id === customerId);
        return { notifications: local };
      }
    }

    const local = getLocalNotifications()
      .filter((n) => n.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { notifications: local };
  },

  /**
   * Get total unread notifications count for customer.
   */
  async getUnreadCount(customerId: string): Promise<number> {
    if (!customerId) return 0;

    const res = await this.getCustomerNotifications(customerId);
    return res.notifications.filter((n) => !n.is_read).length;
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(
    notificationId: string,
    customerId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!notificationId) return { success: false, error: 'Notification ID required' };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('customer_id', customerId);

        if (error) {
          console.warn('Supabase markAsRead error:', error.message);
        }
      } catch (err: any) {
        console.warn('Network error marking notification read:', err.message);
      }
    }

    // Always update local cache
    const local = getLocalNotifications();
    saveLocalNotifications(
      local.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );

    return { success: true };
  },

  /**
   * Mark all unread notifications as read for a customer.
   */
  async markAllAsRead(
    customerId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!customerId) return { success: false, error: 'Customer ID required' };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('customer_id', customerId)
          .eq('is_read', false);

        if (error) {
          console.warn('Supabase markAllAsRead error:', error.message);
        }
      } catch (err: any) {
        console.warn('Network error marking all notifications read:', err.message);
      }
    }

    const local = getLocalNotifications();
    saveLocalNotifications(
      local.map((n) => (n.customer_id === customerId ? { ...n, is_read: true } : n))
    );

    return { success: true };
  },

  /**
   * Delete / dismiss an in-app notification.
   */
  async deleteNotification(
    notificationId: string,
    customerId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('customer_id', customerId);
      } catch (e) {
        console.warn('Could not delete notification from Supabase:', e);
      }
    }

    const local = getLocalNotifications();
    saveLocalNotifications(local.filter((n) => n.id !== notificationId));
    return { success: true };
  },

  /**
   * Create an in-app notification with deduplication & multi-channel simulation.
   */
  async createNotification(
    payload: CreateNotificationPayload,
    extraMessageInfo?: {
      customerPhone?: string;
      customerEmail?: string;
      customerName?: string;
      bookingReference?: string;
      pickupDate?: string;
      pickupTime?: string;
      amount?: number | null;
    }
  ): Promise<{ success: boolean; notification?: NotificationRecord; error?: string }> {
    const customerId = payload.customer_id;
    if (!customerId) {
      return { success: false, error: 'customer_id is required' };
    }

    // Deduplication check: Avoid inserting identical notification if one exists within 30 seconds
    const local = getLocalNotifications();
    const thirtySecondsAgo = Date.now() - 30000;
    const isDuplicate = local.some(
      (n) =>
        n.customer_id === customerId &&
        n.booking_id === payload.booking_id &&
        n.title === payload.title &&
        new Date(n.created_at).getTime() > thirtySecondsAgo
    );

    if (isDuplicate) {
      const existing = local.find(
        (n) =>
          n.customer_id === customerId &&
          n.booking_id === payload.booking_id &&
          n.title === payload.title
      );
      return { success: true, notification: existing };
    }

    const newRecord: NotificationRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}`,
      customer_id: customerId,
      booking_id: payload.booking_id || null,
      title: payload.title,
      message: payload.message,
      notification_type: payload.notification_type,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([
            {
              customer_id: newRecord.customer_id,
              booking_id: newRecord.booking_id,
              title: newRecord.title,
              message: newRecord.message,
              notification_type: newRecord.notification_type,
              is_read: false,
            },
          ])
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert notification error (fallback to local):', error.message);
        } else if (data) {
          const inserted = data as NotificationRecord;
          saveLocalNotifications([inserted, ...local]);
          this.dispatchMultiChannelSimulated(payload, extraMessageInfo);
          return { success: true, notification: inserted };
        }
      } catch (err: any) {
        console.warn('Network error creating notification in Supabase:', err.message);
      }
    }

    // Local fallback
    saveLocalNotifications([newRecord, ...local]);
    this.dispatchMultiChannelSimulated(payload, extraMessageInfo);
    return { success: true, notification: newRecord };
  },

  /**
   * Triggers simulated multi-channel dispatch (Email, SMS, WhatsApp)
   */
  dispatchMultiChannelSimulated(
    payload: CreateNotificationPayload,
    extra?: {
      customerPhone?: string;
      customerEmail?: string;
      customerName?: string;
      bookingReference?: string;
      pickupDate?: string;
      pickupTime?: string;
      amount?: number | null;
    }
  ): void {
    const channelMsg: ChannelMessage = {
      recipientName: extra?.customerName,
      recipientPhone: extra?.customerPhone,
      recipientEmail: extra?.customerEmail,
      title: payload.title,
      body: payload.message,
      notificationType: payload.notification_type,
      bookingReference: extra?.bookingReference,
      pickupDate: extra?.pickupDate,
      pickupTime: extra?.pickupTime,
      amount: extra?.amount,
    };

    // Prepare delivery to all 4 supported channels
    notificationDispatcher.dispatchMultiChannel(
      ['in_app', 'sms', 'whatsapp', 'email'],
      channelMsg
    ).catch((err) => console.warn('Channel dispatch notice:', err));
  },

  // ===========================================================================
  // EVENT TRIGGER HELPERS
  // ===========================================================================

  /**
   * 1. Booking Request Received
   */
  async notifyBookingCreated(
    booking: {
      id: string;
      customer_id?: string | null;
      booking_reference: string;
      area: string;
      pickup_date: string;
      pickup_time: string;
    },
    customerPhone?: string,
    customerEmail?: string,
    customerName?: string
  ): Promise<void> {
    if (!booking.customer_id) return;

    await this.createNotification(
      {
        customer_id: booking.customer_id,
        booking_id: booking.id,
        title: 'Booking Request Received',
        message: `Your pickup request for ${booking.area} (Ref: ${booking.booking_reference}) on ${booking.pickup_date} (${booking.pickup_time}) has been received and is awaiting team confirmation.`,
        notification_type: 'booking_status',
      },
      {
        customerPhone,
        customerEmail,
        customerName,
        bookingReference: booking.booking_reference,
        pickupDate: booking.pickup_date,
        pickupTime: booking.pickup_time,
      }
    );
  },

  /**
   * 2. Booking Status Lifecycle Update
   */
  async notifyBookingStatusUpdated(
    booking: {
      id: string;
      customer_id?: string | null;
      booking_reference: string;
      area: string;
      pickup_address?: string;
      pickup_date: string;
      pickup_time: string;
      cancellation_reason?: string | null;
    },
    newStatus: string,
    customerPhone?: string,
    customerEmail?: string
  ): Promise<void> {
    if (!booking.customer_id) return;

    let title = '';
    let message = '';
    let type: NotificationType = 'booking_status';

    switch (newStatus) {
      case 'Confirmed':
      case 'Booking Confirmed':
        title = 'Booking Confirmed';
        message = `Great news! Your booking ${booking.booking_reference} in ${booking.area} is confirmed. A Pickup Wash rider has been assigned for ${booking.pickup_date} (${booking.pickup_time}).`;
        break;
      case 'Picked Up':
      case 'Clothes Picked Up':
      case 'picked_up':
        title = 'Clothes Picked Up';
        message = `Our rider has collected your laundry from ${booking.pickup_address || booking.area}. Next step: weighing and professional wash.`;
        break;
      case 'Washing & Ironing':
      case 'processing':
      case 'ironing':
        title = 'Washing & Ironing Started';
        message = 'Your clothes are currently undergoing specialized washing, gentle detergent cleaning, and high-pressure steam pressing.';
        break;
      case 'Ready for Delivery':
      case 'ready_for_delivery':
        title = 'Ready for Delivery';
        message = 'Your garments are fresh, crisply ironed, and packaged! Our delivery rider is preparing for doorstep delivery.';
        break;
      case 'Delivered':
      case 'delivered':
        title = 'Order Delivered';
        message = `Your laundry order (${booking.booking_reference}) has been successfully delivered to your doorstep. Thank you for choosing Pickup Wash!`;
        break;
      case 'Cancelled':
      case 'cancelled':
        title = 'Booking Cancelled';
        type = 'cancellation';
        message = `Your booking request (${booking.booking_reference}) has been cancelled.${
          booking.cancellation_reason ? ` Reason: ${booking.cancellation_reason}` : ''
        }`;
        break;
      default:
        return;
    }

    await this.createNotification(
      {
        customer_id: booking.customer_id,
        booking_id: booking.id,
        title,
        message,
        notification_type: type,
      },
      {
        customerPhone,
        customerEmail,
        bookingReference: booking.booking_reference,
        pickupDate: booking.pickup_date,
        pickupTime: booking.pickup_time,
      }
    );
  },

  /**
   * 3. Booking Rescheduled
   */
  async notifyBookingRescheduled(
    booking: {
      id: string;
      customer_id?: string | null;
      booking_reference: string;
      pickup_date: string;
      pickup_time: string;
    },
    customerPhone?: string,
    customerEmail?: string
  ): Promise<void> {
    if (!booking.customer_id) return;

    await this.createNotification(
      {
        customer_id: booking.customer_id,
        booking_id: booking.id,
        title: 'Pickup Slot Rescheduled',
        message: `Your pickup slot for booking ${booking.booking_reference} has been updated to ${booking.pickup_date} (${booking.pickup_time}).`,
        notification_type: 'reschedule',
      },
      {
        customerPhone,
        customerEmail,
        bookingReference: booking.booking_reference,
        pickupDate: booking.pickup_date,
        pickupTime: booking.pickup_time,
      }
    );
  },

  /**
   * 4. Payment Status Update
   */
  async notifyPaymentStatusUpdated(
    payment: {
      id: string;
      booking_id: string;
      customer_id?: string | null;
      payment_method: string;
      payment_status: string;
      payment_amount?: number | null;
      transaction_reference?: string | null;
    },
    bookingReference?: string,
    customerPhone?: string,
    customerEmail?: string
  ): Promise<void> {
    if (!payment.customer_id) return;

    let title = '';
    let message = '';

    switch (payment.payment_status) {
      case 'Awaiting Verification':
        title = 'Payment Awaiting Verification';
        message = `Your transaction reference (${payment.transaction_reference || 'Submitted'}) for ${payment.payment_method} has been received and is being verified manually by our team.`;
        break;
      case 'Paid':
        title = 'Payment Verified & Confirmed';
        message = `Your payment via ${payment.payment_method}${
          payment.payment_amount != null ? ` of PKR ${payment.payment_amount.toLocaleString()}` : ''
        } has been verified and confirmed. Thank you!`;
        break;
      case 'Failed':
        title = 'Payment Verification Notice';
        message = `We could not verify your ${payment.payment_method} transfer. Please review your transaction ID or contact our Kasur helpline at +92 300 0000000.`;
        break;
      case 'Refunded':
        title = 'Payment Refunded';
        message = `Your payment for booking ${bookingReference || ''} via ${payment.payment_method} has been refunded.`;
        break;
      default:
        return;
    }

    await this.createNotification(
      {
        customer_id: payment.customer_id,
        booking_id: payment.booking_id,
        title,
        message,
        notification_type: 'payment_status',
      },
      {
        customerPhone,
        customerEmail,
        bookingReference,
        amount: payment.payment_amount,
      }
    );
  },

  /**
   * Admin: Query all dispatched customer notifications
   */
  async getAllNotifications(limit = 100): Promise<{ notifications: NotificationRecord[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { notifications: getLocalNotifications().slice(0, limit) };
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { notifications: [], error: error.message };
      }

      return { notifications: (data as NotificationRecord[]) || [] };
    } catch (err: any) {
      return {
        notifications: [],
        error: err.message || 'Error occurred while loading notification records.',
      };
    }
  },
};
