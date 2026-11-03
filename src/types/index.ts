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

export type OrderStatus =
  | 'pending_pickup'
  | 'picked_up'
  | 'processing'
  | 'ironing'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type BookingStatus =
  | 'Booking Request Received'
  | 'Booking Confirmed'
  | 'Clothes Picked Up'
  | 'Washing & Ironing'
  | 'Ready for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'JazzCash'
  | 'Easypaisa'
  | 'Bank Transfer';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

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
  created_at: string;
  updated_at: string;
}

export interface ServiceRecord {
  id: string;
  service_name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface MonthlyPackageRecord {
  id: string;
  package_name: string;
  slug: string;
  description: string;
  price: number | null; // Nullable until confirmed with business in Kasur
  is_active: boolean;
  created_at: string;
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
