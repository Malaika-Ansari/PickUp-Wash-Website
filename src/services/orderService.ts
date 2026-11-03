import { supabase, isSupabaseConfigured } from './supabase';
import { BookingFormData, Order, OrderStatus } from '@/types';
import { CORE_SERVICES } from '@/utils/constants';

// Local storage backup key for fallback/offline development mode
const LOCAL_ORDERS_KEY = 'pickupwash_orders';

const getLocalOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving local orders:', e);
  }
};

export const orderService = {
  // Generate Kasur tracking code e.g. PW-KSR-10492
  generateTrackingCode(): string {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `PW-KSR-${randomNum}`;
  },

  async createOrder(data: BookingFormData, userId?: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    const trackingNumber = this.generateTrackingCode();
    const service = CORE_SERVICES.find((s) => s.id === data.serviceId) || CORE_SERVICES[0];

    const newOrder: Order = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      trackingNumber,
      userId,
      customerName: data.fullName,
      customerPhone: data.phoneNumber,
      pickupAddress: `${data.streetAddress}${data.landmark ? ` (Near ${data.landmark})` : ''}`,
      area: data.area,
      pickupDate: data.pickupDate,
      pickupTimeSlot: data.pickupTimeSlot,
      status: 'pending_pickup',
      items: [
        {
          serviceId: service.id,
          serviceTitle: service.title,
          quantity: 1,
          unitPrice: service.pricePerUnit,
          totalPrice: service.pricePerUnit,
        },
      ],
      totalAmount: service.pricePerUnit,
      specialInstructions: data.specialInstructions,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('orders').insert([
          {
            tracking_number: newOrder.trackingNumber,
            user_id: newOrder.userId || null,
            customer_name: newOrder.customerName,
            customer_phone: newOrder.customerPhone,
            pickup_address: newOrder.pickupAddress,
            area: newOrder.area,
            pickup_date: newOrder.pickupDate,
            pickup_time_slot: newOrder.pickupTimeSlot,
            status: newOrder.status,
            total_amount: newOrder.totalAmount,
            special_instructions: newOrder.specialInstructions,
            payment_method: newOrder.paymentMethod,
            payment_status: newOrder.paymentStatus,
          },
        ]);

        if (error) {
          console.warn('Supabase insert failed, falling back to local storage:', error.message);
        }
      } catch (err) {
        console.warn('Network error reaching Supabase, storing locally:', err);
      }
    }

    // Always update local cache so user immediately sees their order
    const local = getLocalOrders();
    saveLocalOrders([newOrder, ...local]);

    return { success: true, order: newOrder };
  },

  async getOrderByTracking(trackingNumber: string): Promise<Order | null> {
    const cleanNumber = trackingNumber.trim().toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('tracking_number', cleanNumber)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            trackingNumber: data.tracking_number,
            userId: data.user_id,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            pickupAddress: data.pickup_address,
            area: data.area,
            pickupDate: data.pickup_date,
            pickupTimeSlot: data.pickup_time_slot,
            status: data.status,
            items: [],
            totalAmount: data.total_amount,
            specialInstructions: data.special_instructions,
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Error fetching from Supabase, checking local:', err);
      }
    }

    const local = getLocalOrders();
    const match = local.find((o) => o.trackingNumber.toUpperCase() === cleanNumber);
    return match || null;
  },

  async getCustomerOrders(
    userId?: string,
    customerPhone?: string,
    customerEmail?: string
  ): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('orders').select('*');
        if (userId) {
          query = query.eq('user_id', userId);
        } else if (customerPhone) {
          query = query.eq('customer_phone', customerPhone);
        } else {
          return [];
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (data && !error) {
          return data.map((d) => ({
            id: d.id,
            trackingNumber: d.tracking_number,
            userId: d.user_id,
            customerName: d.customer_name,
            customerPhone: d.customer_phone,
            pickupAddress: d.pickup_address,
            area: d.area,
            pickupDate: d.pickup_date,
            pickupTimeSlot: d.pickup_time_slot,
            status: d.status,
            items: [
              {
                serviceId: d.service_id || 'wash-and-iron',
                serviceTitle: d.service_title || 'Wash & Iron',
                quantity: 1,
                unitPrice: d.total_amount || 0,
                totalPrice: d.total_amount || 0,
              },
            ],
            totalAmount: d.total_amount,
            specialInstructions: d.special_instructions,
            paymentMethod: d.payment_method,
            paymentStatus: d.payment_status,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Error fetching customer orders from Supabase:', err);
      }
    }

    // Filter local orders strictly for the authenticated customer only
    const local = getLocalOrders();
    return local.filter((o) => {
      if (userId && o.userId === userId) return true;
      if (customerPhone && o.customerPhone && o.customerPhone === customerPhone) return true;
      if (customerEmail && o.customerPhone && o.customerPhone.includes(customerEmail)) return true;
      return false;
    });
  },

  async getAllOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data.map((d) => ({
            id: d.id,
            trackingNumber: d.tracking_number,
            userId: d.user_id,
            customerName: d.customer_name,
            customerPhone: d.customer_phone,
            pickupAddress: d.pickup_address,
            area: d.area,
            pickupDate: d.pickup_date,
            pickupTimeSlot: d.pickup_time_slot,
            status: d.status,
            items: [],
            totalAmount: d.total_amount,
            specialInstructions: d.special_instructions,
            paymentMethod: d.payment_method,
            paymentStatus: d.payment_status,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Error fetching all orders from Supabase:', err);
      }
    }

    return getLocalOrders();
  },

  async updateOrderStatus(trackingNumber: string, status: OrderStatus): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('tracking_number', trackingNumber);
      } catch (err) {
        console.warn('Failed to update status on Supabase:', err);
      }
    }

    const local = getLocalOrders();
    const updated = local.map((order) =>
      order.trackingNumber === trackingNumber
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    );
    saveLocalOrders(updated);
    return true;
  },
};

