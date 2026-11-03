export type UserRole = 'customer' | 'admin' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  address?: string;
  area?: string;
  role: UserRole;
  created_at: string;
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
  items: OrderItem[];
  totalAmount: number;
  specialInstructions?: string;
  paymentMethod: 'cash_on_delivery' | 'easypaisa_jazzcash' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid';
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
  paymentMethod: 'cash_on_delivery' | 'easypaisa_jazzcash' | 'bank_transfer';
}

