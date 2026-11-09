export type UserRole = 'customer' | 'admin' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  phone?: string;
  address?: string;
  area?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export type BookingStatus =
  | 'Request Received'
  | 'Confirmed'
  | 'Picked Up'
  | 'Washing & Ironing'
  | 'Ready for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Booking Request Received'
  | 'Booking Confirmed'
  | 'Clothes Picked Up';

export type OrderStatus =
  | BookingStatus
  | 'pending_pickup'
  | 'picked_up'
  | 'processing'
  | 'ironing'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'JazzCash'
  | 'Easypaisa'
  | 'Bank Transfer';

export type PaymentStatus =
  | 'Pending'
  | 'Awaiting Verification'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  pricePerUnit: number;
  unit: 'kg' | 'piece' | 'suit';
  turnaroundTime: string; // e.g. "24 Hours" or "48 Hours"
  icon: string;
  features: string[];
  popular?: boolean;
}

export interface OrderItem {
  serviceId: string;
  serviceTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  trackingNumber: string; // e.g. "PW-KSR-2026-081"
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  area: string;
  pickupDate: string;
  pickupTimeSlot: string;
  status: OrderStatus;
  bookingStatus?: BookingStatus;
  items: OrderItem[];
  totalAmount: number;
  specialInstructions?: string;
  paymentMethod: 'cash_on_delivery' | 'easypaisa_jazzcash' | 'bank_transfer' | PaymentMethod;
  paymentStatus: 'pending' | 'paid' | PaymentStatus;
  cancellationReason?: string;
  cancelledAt?: string;
  rescheduledDate?: string;
  rescheduledTime?: string;
  rescheduleReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  fullName: string;
  phoneNumber: string;
  email?: string;
  area: string;
  streetAddress: string;
  landmark?: string;
  serviceId: string;
  estimatedWeightOrPieces?: string;
  pickupDate: string;
  pickupTimeSlot: string;
  specialInstructions?: string;
  paymentMethod: 'cash_on_delivery' | 'easypaisa_jazzcash' | 'bank_transfer' | PaymentMethod;
}

// ==============================================================================
// SUPABASE POSTGRESQL DATABASE RECORD INTERFACES
// ==============================================================================

export interface ProfileRecord {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  area: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface BookingRecord {
  id: string;
  customer_id: string | null;
  booking_reference: string;
  service_type: string;
  pickup_address: string;
  area: string;
  pickup_date: string;
  pickup_time: string;
  special_instructions: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  rescheduled_date?: string | null;
  rescheduled_time?: string | null;
  reschedule_reason?: string | null;
  rescheduled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyCheckResult {
  canCancel: boolean;
  canReschedule: boolean;
  reason?: string;
  hoursElapsed: number;
  hoursRemaining: number;
  timeRemainingFormatted: string;
}

export interface ServiceRecord {
  id: string;
  service_name: string;
  slug: string;
  description: string;
  is_active: boolean;
  price_per_kg?: number | null;
  base_price?: number | null;
  special_charge?: number | null;
  price_unit?: string | null;
  is_pricing_active?: boolean;
  pricing_notes?: string | null;
  turnaround_time?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ServicePricingRecord {
  id: string;
  service_id: string;
  title: string;
  pricing_type: 'per_kg' | 'per_item' | 'special_charge' | 'fixed';
  rate: number | null;
  unit: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PromotionRecord {
  id: string;
  promo_code: string;
  title: string;
  description: string;
  discount_type: 'free_pickup' | 'percentage' | 'fixed';
  is_active: boolean;
  terms?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MonthlyPackageRecord {
  id: string;
  package_name: string;
  slug: string;
  description: string;
  price: number | null; // Nullable until confirmed with business in Kasur
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BookingStatusHistoryRecord {
  id: string;
  booking_id: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  notes: string | null;
}

export interface CreateBookingPayload {
  customer_id?: string | null;
  booking_reference?: string;
  service_type: string;
  pickup_address: string;
  area: string;
  pickup_date: string;
  pickup_time: string;
  special_instructions?: string | null;
  payment_method: PaymentMethod;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  address?: string;
  area?: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  customer_id: string | null;
  payment_method: PaymentMethod;
  payment_amount: number | null; // Nullable until actual rates are confirmed
  payment_status: PaymentStatus;
  transaction_reference?: string | null;
  payment_notes?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentPayload {
  booking_id: string;
  customer_id?: string | null;
  payment_method: PaymentMethod;
  payment_amount?: number | null;
  payment_status?: PaymentStatus;
  transaction_reference?: string | null;
  payment_notes?: string | null;
}

export const normalizePaymentStatus = (
  status?: string
): 'Pending' | 'Awaiting Verification' | 'Paid' | 'Failed' | 'Refunded' => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'Paid';
    case 'awaiting verification':
    case 'awaiting_verification':
      return 'Awaiting Verification';
    case 'failed':
      return 'Failed';
    case 'refunded':
      return 'Refunded';
    case 'pending':
    default:
      return 'Pending';
  }
};

export type NotificationType =
  | 'booking_status'
  | 'payment_status'
  | 'cancellation'
  | 'reschedule'
  | 'system';

export interface NotificationRecord {
  id: string;
  customer_id: string;
  booking_id?: string | null;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationPayload {
  customer_id: string;
  booking_id?: string | null;
  title: string;
  message: string;
  notification_type: NotificationType;
}

export interface AdminAuditLog {
  id: string;
  admin_id?: string | null;
  admin_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, any> | string | null;
  ip_address?: string | null;
  created_at: string;
}

export interface CreateAdminAuditLogPayload {
  admin_id?: string | null;
  admin_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, any> | string | null;
  ip_address?: string | null;
}
